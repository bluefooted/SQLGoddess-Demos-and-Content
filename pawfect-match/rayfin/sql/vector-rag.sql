-- Companion vector schema for SQL database in Fabric.
-- Before running, create a database master key and the following credential outside
-- source control. Set SECRET to a JSON object containing the Azure OpenAI api-key:
-- CREATE DATABASE SCOPED CREDENTIAL
--     [https://ai-pamdemoaihub880628764654.openai.azure.com]
-- WITH IDENTITY = 'HTTPEndpointHeaders', SECRET = '<api-key JSON>';

IF NOT EXISTS
(
    SELECT 1
    FROM sys.database_scoped_credentials
    WHERE name = N'https://ai-pamdemoaihub880628764654.openai.azure.com'
)
BEGIN
    THROW 50000, 'Create the Azure OpenAI database scoped credential before applying this script.', 1;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.external_models
    WHERE name = N'PawfectEmbeddingModel'
)
BEGIN
    CREATE EXTERNAL MODEL PawfectEmbeddingModel
    WITH
    (
        LOCATION = 'https://ai-pamdemoaihub880628764654.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings?api-version=2024-02-01',
        API_FORMAT = 'Azure OpenAI',
        MODEL_TYPE = EMBEDDINGS,
        MODEL = 'text-embedding-3-small',
        CREDENTIAL = [https://ai-pamdemoaihub880628764654.openai.azure.com],
        PARAMETERS = '{"dimensions":1536,"sql_rest_options":{"retry_count":3}}'
    );
END;
GO

IF OBJECT_ID(N'dbo.PetKnowledgeChunk', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PetKnowledgeChunk
    (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PetKnowledgeChunk PRIMARY KEY,
        pet_id UNIQUEIDENTIFIER NOT NULL,
        source_type NVARCHAR(60) NOT NULL,
        source_id UNIQUEIDENTIFIER NOT NULL,
        source_label NVARCHAR(200) NOT NULL,
        chunk_text NVARCHAR(3000) NOT NULL,
        embedding VECTOR(1536) NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_PetKnowledgeChunk_created_at DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_PetKnowledgeChunk_pet_id ON dbo.PetKnowledgeChunk(pet_id);
END;
GO

CREATE OR ALTER PROCEDURE dbo.IndexPetKnowledge
    @pet_id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DELETE FROM dbo.PetKnowledgeChunk
    WHERE @pet_id IS NULL OR pet_id = @pet_id;

    INSERT INTO dbo.PetKnowledgeChunk
    (
        id,
        pet_id,
        source_type,
        source_id,
        source_label,
        chunk_text,
        embedding
    )
    SELECT
        NEWID(),
        p.id,
        N'PetProfile',
        p.id,
        CONCAT(p.name, N' adoption profile'),
        profile.chunk_text,
        AI_GENERATE_EMBEDDINGS(profile.chunk_text USE MODEL PawfectEmbeddingModel)
    FROM dbo.Pets AS p
    CROSS APPLY
    (
        VALUES
        (
            LEFT(CONCAT(
                p.name, N' is a ', p.ageYears, N'-year-old ', p.size, N' ', p.breed, N' ', p.species,
                N'. Energy level: ', p.energyLevel,
                N'. Temperament: ', p.temperament,
                N'. Good with children: ', IIF(p.goodWithKids = 1, N'yes', N'no'),
                N'. Good with other pets: ', IIF(p.goodWithOtherPets = 1, N'yes', N'no'),
                N'. Housing needs: ', p.housingNeeds,
                N'. Biography: ', p.bio
            ), 3000)
        )
    ) AS profile(chunk_text)
    WHERE @pet_id IS NULL OR p.id = @pet_id;

    INSERT INTO dbo.PetKnowledgeChunk
    (
        id,
        pet_id,
        source_type,
        source_id,
        source_label,
        chunk_text,
        embedding
    )
    SELECT
        NEWID(),
        n.pet_id,
        N'CareNote',
        n.id,
        n.sourceLabel,
        LEFT(CONCAT(n.noteType, N': ', n.body), 3000),
        AI_GENERATE_EMBEDDINGS(
            LEFT(CONCAT(n.noteType, N': ', n.body), 3000)
            USE MODEL PawfectEmbeddingModel
        )
    FROM dbo.CareNotes AS n
    WHERE @pet_id IS NULL OR n.pet_id = @pet_id;

    SELECT COUNT_BIG(*) AS indexed_chunk_count
    FROM dbo.PetKnowledgeChunk
    WHERE @pet_id IS NULL OR pet_id = @pet_id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.SearchPetKnowledge
    @query_embedding VECTOR(1536),
    @species NVARCHAR(60) = NULL,
    @good_with_kids BIT = NULL,
    @energy_level NVARCHAR(40) = NULL,
    @top INT = 12
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@top)
        p.id AS pet_id,
        p.name AS pet_name,
        p.shelter_id,
        s.name AS shelter_name,
        p.species,
        p.breed,
        p.ageYears AS age_years,
        p.size,
        p.energyLevel AS energy_level,
        p.temperament,
        p.goodWithKids AS good_with_kids,
        p.goodWithOtherPets AS good_with_other_pets,
        p.housingNeeds AS housing_needs,
        p.bio,
        p.imageUrl AS image_url,
        p.recommendationCount AS recommendation_count,
        k.source_type,
        k.source_id,
        k.source_label,
        k.chunk_text,
        1 - VECTOR_DISTANCE('cosine', k.embedding, @query_embedding) AS similarity
    FROM dbo.PetKnowledgeChunk AS k
    INNER JOIN dbo.Pets AS p ON p.id = k.pet_id
    INNER JOIN dbo.Shelters AS s ON s.id = p.shelter_id
    WHERE p.adoptionStatus = N'Available'
      AND (@species IS NULL OR p.species = @species)
      AND (@good_with_kids IS NULL OR p.goodWithKids = @good_with_kids)
      AND (@energy_level IS NULL OR p.energyLevel = @energy_level)
    ORDER BY VECTOR_DISTANCE('cosine', k.embedding, @query_embedding);
END;
GO

CREATE OR ALTER PROCEDURE dbo.MatchPetsByLifestyle
    @lifestyle_text NVARCHAR(3000),
    @species NVARCHAR(60) = NULL,
    @good_with_kids BIT = NULL,
    @energy_level NVARCHAR(40) = NULL,
    @top INT = 3
AS
BEGIN
    SET NOCOUNT ON;

    IF NULLIF(TRIM(@lifestyle_text), N'') IS NULL
        THROW 50001, 'Lifestyle text is required.', 1;

    IF @top < 1 OR @top > 20
        THROW 50002, 'Top must be between 1 and 20.', 1;

    DECLARE @query_embedding VECTOR(1536) =
        AI_GENERATE_EMBEDDINGS(@lifestyle_text USE MODEL PawfectEmbeddingModel);

    EXEC dbo.SearchPetKnowledge
        @query_embedding = @query_embedding,
        @species = @species,
        @good_with_kids = @good_with_kids,
        @energy_level = @energy_level,
        @top = @top;
END;
GO