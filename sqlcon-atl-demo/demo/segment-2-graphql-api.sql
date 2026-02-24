/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  SEGMENT 3 ► GraphQL API Endpoint (3:00–4:30)
  
  THEME: SaaS by default
  
  TALKING POINTS:
  • "So the database observes itself and tunes itself. But
     what if you need an API on top of this data?
     Traditionally you'd build a whole backend —
     controllers, ORM, deployment."
  • "With SQL database in Fabric, you get a GraphQL
     endpoint automatically. Let me show you."
  
  DEMO FLOW:
  1. Open Fabric portal → navigate to the SQL database
  2. Click "New" → "GraphQL API"  
  3. Select retail tables → it generates the endpoint
  4. Run a GraphQL query live in the built-in explorer
  5. Show the endpoint URL — ready for any app to consume
  
  NOTE: This segment is portal-driven, but the queries below
  are what you'll paste into the GraphQL explorer.
============================================================*/

-- ════════════════════════════════════════════════
-- STEP 1: Create a view for the GraphQL API
-- ════════════════════════════════════════════════
-- 🎤 "First, let me create a clean view that shapes our
--     data exactly how an app developer wants it."

CREATE OR ALTER VIEW retail.vw_OrderSummary AS
SELECT
    o.OrderId,
    o.OrderDate,
    o.Status,
    o.TotalAmount,
    c.FirstName + ' ' + c.LastName AS CustomerName,
    c.Email,
    c.MemberTier,
    r.RegionName,
    (SELECT COUNT(*) FROM retail.OrderItems oi WHERE oi.OrderId = o.OrderId) AS ItemCount
FROM retail.Orders o
JOIN retail.Customers c ON c.CustomerId = o.CustomerId
JOIN retail.Regions r   ON r.RegionId = o.RegionId;
GO

-- ════════════════════════════════════════════════
-- STEP 2: Create a stored procedure for mutations
-- ════════════════════════════════════════════════
-- 🎤 "I can also expose stored procedures as GraphQL
--     mutations — full CRUD without building a backend."

CREATE OR ALTER PROCEDURE retail.usp_UpdateOrderStatus
    @OrderId INT,
    @NewStatus NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @NewStatus NOT IN ('Pending', 'Shipped', 'Completed', 'Cancelled')
    BEGIN
        THROW 50001, 'Invalid status. Use: Pending, Shipped, Completed, or Cancelled.', 1;
    END

    UPDATE retail.Orders
    SET Status = @NewStatus
    WHERE OrderId = @OrderId;

    SELECT OrderId, Status, TotalAmount, OrderDate
    FROM retail.Orders
    WHERE OrderId = @OrderId;
END;
GO

PRINT '✅ View and stored procedure ready for GraphQL API.';
PRINT '';
PRINT '══════════════════════════════════════════════════';
PRINT '  NOW SWITCH TO THE FABRIC PORTAL:';
PRINT '  1. Go to your SQL database item';
PRINT '  2. Click ellipsis (...) → "New GraphQL API"';
PRINT '  3. Name it: RetailAPI';
PRINT '  4. Select tables: Customers, Products, Orders,';
PRINT '     OrderItems, and the vw_OrderSummary view';
PRINT '  5. Also expose: usp_UpdateOrderStatus';
PRINT '══════════════════════════════════════════════════';
GO

-- ════════════════════════════════════════════════
-- STEP 3: GraphQL queries to paste into the explorer
-- ════════════════════════════════════════════════

/*
── QUERY 1: Get recent orders with customer info ──

query RecentOrders {
  orderSummaries(
    filter: { status: { eq: "Completed" } }
    first: 10
    orderBy: { orderDate: DESC }
  ) {
    items {
      orderId
      orderDate
      totalAmount
      customerName
      memberTier
      regionName
      itemCount
    }
  }
}

── QUERY 2: Product catalog with filtering ──

query ProductsByCategory {
  products(
    filter: { 
      categoryId: { eq: 1 }
      unitPrice: { gte: 500 }
    }
    orderBy: { unitPrice: DESC }
  ) {
    items {
      productId
      productName
      unitPrice
      stockQty
    }
  }
}

── QUERY 3: Customer lookup ──

query PlatinumCustomers {
  customers(
    filter: { memberTier: { eq: "Platinum" } }
    first: 5
  ) {
    items {
      customerId
      firstName
      lastName
      email
      regionId
    }
  }
}

── MUTATION: Update order status ──

mutation UpdateStatus {
  executeUpdateOrderStatus(
    orderId: 1
    newStatus: "Shipped"
  ) {
    result {
      orderId
      status
      totalAmount
    }
  }
}

*/

PRINT '';
PRINT '🎤 TRANSITION: "An instant GraphQL API — no Express,';
PRINT '   no Django, no deployment pipeline. That is SaaS';
PRINT '   by default. Now let me show you enterprise-grade';
PRINT '   security in under 90 seconds..."';
GO
