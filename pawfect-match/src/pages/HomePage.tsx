import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, BarChart3, BookOpen, Building2, Check, ChevronRight,
  CircleGauge, Heart, LayoutDashboard, LogOut, PawPrint, Plus, Search, Send,
  Sparkles, Users, X,
} from 'lucide-react';

import { useAuth } from '@/hooks/AuthContext';
import { matchPets, type MatchResponse } from '@/services/matching';
import { addCareNote, addDemoPet, getCareNotes, getPetProfiles, getPets, type CareNoteRecord, type PetProfileRecord, type PetRecord } from '@/services/pets';

type View = 'discover' | 'match' | 'shelter' | 'insights';
const EXAMPLE_PROFILE = 'I live in an apartment, have two kids, work from home three days a week, and want a calm dog that is good with families.';

export function HomePage() {
  const { signOut, user } = useAuth();
  const [view, setView] = useState<View>('discover');
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [notes, setNotes] = useState<CareNoteRecord[]>([]);
  const [profiles, setProfiles] = useState<PetProfileRecord[]>([]);
  const refresh = async () => {
    const [petRows, noteRows, profileRows] = await Promise.all([getPets(), getCareNotes(), getPetProfiles()]);
    setPets(petRows); setNotes(noteRows); setProfiles(profileRows);
  };
  useEffect(() => { void refresh(); }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView('discover')}>
          <span className="brand-mark"><PawPrint size={21} /></span>
          <span><strong>Pawfect Match</strong><small>Shelter intelligence</small></span>
        </button>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavButton active={view === 'discover'} icon={<Search />} label="Discover pets" onClick={() => setView('discover')} />
          <NavButton active={view === 'match'} icon={<Sparkles />} label="AI matchmaker" onClick={() => setView('match')} />
          <NavButton active={view === 'shelter'} icon={<Building2 />} label="Shelter desk" onClick={() => setView('shelter')} />
          <NavButton active={view === 'insights'} icon={<LayoutDashboard />} label="Insights" onClick={() => setView('insights')} />
        </nav>
        <div className="sidebar-status"><span className="status-dot" /><span><strong>Fabric SQL connected</strong><small>{pets.length} pet profiles available</small></span></div>
        <div className="account">
          <span className="avatar">{user?.email?.[0]?.toUpperCase() ?? 'P'}</span>
          <span className="account-copy"><strong>Shelter team</strong><small>{user?.email ?? 'Signed in'}</small></span>
          <button className="icon-button" onClick={() => void signOut()} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="workspace">
        {view === 'discover' && <DiscoverView pets={pets} profiles={profiles} onMatch={() => setView('match')} />}
        {view === 'match' && <MatchView />}
        {view === 'shelter' && <ShelterView pets={pets} notes={notes} onChanged={refresh} />}
        {view === 'insights' && <InsightsView pets={pets} />}
      </main>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'nav-button active' : 'nav-button'} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function ViewHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="view-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

function DiscoverView({ pets, profiles, onMatch }: { pets: PetRecord[]; profiles: PetProfileRecord[]; onMatch: () => void }) {
  const [query, setQuery] = useState(''); const [species, setSpecies] = useState('All'); const [status, setStatus] = useState('Available');
  const [selectedPet, setSelectedPet] = useState<PetRecord>();
  const filtered = pets.filter((pet) => `${pet.name} ${pet.breed} ${pet.temperament.join(' ')}`.toLowerCase().includes(query.toLowerCase()) && (species === 'All' || pet.species === species) && (status === 'All' || pet.adoptionStatus === status));
  return <div className="view">
    <ViewHeader eyebrow="Adoption catalog" title="Find the right companion" copy="Search complete profiles from participating shelters, then use lifestyle matching to go deeper." action={<button className="primary-button" onClick={onMatch}><Sparkles size={17} /> Match my lifestyle</button>} />
    <section className="filter-bar" aria-label="Pet filters">
      <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, breed, or temperament" /></label>
      <label><span>Species</span><select value={species} onChange={(event) => setSpecies(event.target.value)}><option>All</option><option>Dog</option><option>Cat</option><option>Rabbit</option></select></label>
      <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Available</option><option>Pending</option><option>Adopted</option></select></label>
      <div className="result-count"><strong>{filtered.length}</strong><span>pets found</span></div>
    </section>
    <section className="pet-grid">{filtered.map((pet) => <PetCard pet={pet} key={pet.id} onView={() => setSelectedPet(pet)} />)}</section>
    {selectedPet && <PetProfileDialog pet={selectedPet} profile={profiles.find((profile) => profile.petId === selectedPet.id)} onClose={() => setSelectedPet(undefined)} />}
  </div>;
}

function PetCard({ pet, onView }: { pet: PetRecord; onView: () => void }) {
  return <article className="pet-card">
    <div className="pet-photo"><img src={pet.imageUrl} alt={`${pet.name}, ${pet.breed}`} /><span className={`availability ${pet.adoptionStatus.toLowerCase()}`}>{pet.adoptionStatus}</span></div>
    <div className="pet-card-body">
      <div className="pet-title"><div><h2>{pet.name}</h2><p>{pet.breed} · {pet.ageYears} {pet.ageYears === 1 ? 'year' : 'years'} · {pet.size}</p></div><button className="icon-button favorite" title={`Save ${pet.name}`}><Heart size={19} /></button></div>
      <div className="trait-row">{pet.temperament.map((trait) => <span key={trait}>{trait}</span>)}</div>
      <dl className="pet-facts"><div><dt>Energy</dt><dd>{pet.energyLevel}</dd></div><div><dt>Kids</dt><dd>{pet.goodWithKids ? 'Yes' : 'No'}</dd></div><div><dt>Other pets</dt><dd>{pet.goodWithOtherPets ? 'Yes' : 'No'}</dd></div></dl>
      <p className="housing"><Building2 size={15} />{pet.housingNeeds}</p>
      <footer><span>{pet.shelterName}</span><button className="text-button" onClick={onView}>View profile <ChevronRight size={16} /></button></footer>
    </div>
  </article>;
}

function PetProfileDialog({ pet, profile, onClose }: { pet: PetRecord; profile?: PetProfileRecord; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <article className="modal pet-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="pet-profile-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span className="eyebrow">Complete pet profile</span><h2 id="pet-profile-title">{pet.name}</h2><p>{pet.breed} · {pet.ageYears} {pet.ageYears === 1 ? 'year' : 'years'} · {pet.size}</p></div><button className="icon-button" onClick={onClose} aria-label="Close profile"><X size={20} /></button></header>
      <div className="profile-intro"><img src={pet.imageUrl} alt={`${pet.name}, ${pet.breed}`} /><div><p>{pet.bio}</p><div className="trait-row">{pet.temperament.map((trait) => <span key={trait}>{trait}</span>)}</div></div></div>
      {profile ? <dl className="profile-details"><div><dt>Daily routine</dt><dd>{profile.dailyRoutine}</dd></div><div><dt>Ideal home</dt><dd>{profile.idealHome}</dd></div><div><dt>Medical summary</dt><dd>{profile.medicalSummary}</dd></div><div><dt>Training notes</dt><dd>{profile.trainingNotes}</dd></div></dl> : <p className="profile-empty">Detailed profile information is still being prepared.</p>}
      <footer><span>{pet.shelterName}</span><button className="secondary-button" onClick={onClose}>Close</button></footer>
    </article>
  </div>;
}

function MatchView() {
  const [profile, setProfile] = useState(EXAMPLE_PROFILE); const [response, setResponse] = useState<MatchResponse>(); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const runMatch = async () => { if (!profile.trim()) return; setLoading(true); setError(''); try { setResponse(await matchPets(profile)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Matching failed.'); } finally { setLoading(false); } };
  return <div className="view match-view">
    <ViewHeader eyebrow="Hybrid retrieval" title="Describe your everyday life" copy="We combine structured compatibility filters with semantic evidence from bios, foster notes, and individual care guides." />
    <section className="match-composer"><div className="composer-heading"><span className="spark-icon"><Sparkles size={20} /></span><div><h2>Your lifestyle, in your words</h2><p>Include your home, household, schedule, activity level, and what you hope for in a pet.</p></div></div><textarea value={profile} onChange={(event) => setProfile(event.target.value)} rows={5} aria-label="Lifestyle description" /><div className="composer-footer"><span>{profile.length} characters · richer detail improves retrieval</span><button className="primary-button" onClick={() => void runMatch()} disabled={loading || !profile.trim()}>{loading ? <span className="spinner" /> : <Sparkles size={17} />}{loading ? 'Finding matches...' : 'Find my matches'}</button></div></section>
    {error && <p className="error-banner"><AlertTriangle size={18} />{error}</p>}
    {!response && <section className="retrieval-strip"><CircleGauge size={20} /><div><strong>How matching works</strong><p>SQL narrows by species, status, household, housing, and energy. Vector similarity ranks narrative evidence. The final response cites the notes behind each recommendation.</p></div></section>}
    {response && <section className="match-results"><div className="results-heading"><div><span className="eyebrow">Ranked recommendations</span><h2>Your strongest matches</h2></div><span className={`mode-badge ${response.mode}`}><span />{response.mode === 'fabric-ai' ? 'Fabric SQL vector RAG' : 'Demo semantic fallback'}</span></div><div className="extracted-traits"><span>Understood:</span>{response.extractedTraits.map((trait) => <strong key={trait}><Check size={13} />{trait}</strong>)}</div>{response.results.map((result, index) => <article className="match-result" key={result.pet.id}>
      <div className="match-rank">{String(index + 1).padStart(2, '0')}</div><img src={result.pet.imageUrl} alt={result.pet.name} />
      <div className="match-summary"><span>{result.pet.shelterName}</span><h3>{result.pet.name}</h3><p>{result.pet.breed} · {result.pet.ageYears} years · {result.pet.energyLevel} energy</p><div className="score"><strong>{result.score}%</strong><span><i style={{ width: `${result.score}%` }} /></span><small>compatibility</small></div></div>
      <div className="match-evidence"><div className="evidence-column positive"><h4><Check size={16} /> Why it works</h4>{result.why.map((item) => <p key={item}>{item}</p>)}</div><div className="evidence-column concern"><h4><AlertTriangle size={16} /> Consider</h4>{result.concerns.map((item) => <p key={item}>{item}</p>)}</div></div>
      <div className="citations"><h4><BookOpen size={15} /> Evidence used</h4>{result.citations.map((citation) => <blockquote key={citation.id}>“{citation.body}”<cite>{citation.sourceLabel}</cite></blockquote>)}</div><button className="apply-button">Start an application <ArrowRight size={16} /></button>
    </article>)}</section>}
  </div>;
}

function ShelterView({ pets, notes, onChanged }: { pets: PetRecord[]; notes: CareNoteRecord[]; onChanged: () => Promise<void> }) {
  const [panel, setPanel] = useState<'pets' | 'notes'>('pets'); const [showAdd, setShowAdd] = useState(false); const [newNote, setNewNote] = useState(''); const [notePet, setNotePet] = useState('pet-luna');
  const addPet = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); await addDemoPet({ shelterId: 'shelter-city', shelterName: 'City Tails Rescue', name: String(data.get('name')), species: String(data.get('species')), breed: String(data.get('breed')), ageYears: Number(data.get('age')), size: String(data.get('size')), energyLevel: String(data.get('energy')), temperament: ['Friendly', 'New arrival'], goodWithKids: true, goodWithOtherPets: true, housingNeeds: 'Assessment in progress.', bio: String(data.get('bio')), adoptionStatus: 'Available' }); setShowAdd(false); await onChanged(); };
  const saveNote = async () => { if (!newNote.trim()) return; await addCareNote({ petId: notePet, noteType: 'Foster note', body: newNote, sourceLabel: `Staff note · ${new Date().toLocaleDateString()}`, authorEmail: 'team@pawfectmatch.org' }); setNewNote(''); await onChanged(); };
  return <div className="view">
    <ViewHeader eyebrow="Shelter operations" title="Keep every profile adoption-ready" copy="Manage inventory and add the first-hand evidence that makes recommendations trustworthy." action={<button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add pet</button>} />
    <div className="segmented"><button className={panel === 'pets' ? 'active' : ''} onClick={() => setPanel('pets')}>Pet inventory <span>{pets.length}</span></button><button className={panel === 'notes' ? 'active' : ''} onClick={() => setPanel('notes')}>Care notes <span>{notes.length}</span></button></div>
    {panel === 'pets' ? <section className="data-table-wrap"><table><thead><tr><th>Pet</th><th>Profile</th><th>Compatibility</th><th>Status</th><th>Recommended</th><th /></tr></thead><tbody>{pets.map((pet) => <tr key={pet.id}><td><div className="table-pet"><img src={pet.imageUrl} alt="" /><span><strong>{pet.name}</strong><small>{pet.shelterName}</small></span></div></td><td>{pet.breed}<small>{pet.ageYears} years · {pet.size}</small></td><td><div className="micro-traits"><span>{pet.energyLevel} energy</span><span>{pet.goodWithKids ? 'Kids ✓' : 'No kids'}</span></div></td><td><span className={`table-status ${pet.adoptionStatus.toLowerCase()}`}>{pet.adoptionStatus}</span></td><td><strong>{pet.recommendationCount}</strong><small>match results</small></td><td><button className="icon-button"><ChevronRight size={17} /></button></td></tr>)}</tbody></table></section> :
      <div className="notes-layout"><section className="note-composer"><h2>Add field evidence</h2><p>Foster and care observations become citable retrieval sources.</p><label>Pet<select value={notePet} onChange={(event) => setNotePet(event.target.value)}>{pets.map((pet) => <option value={pet.id} key={pet.id}>{pet.name}</option>)}</select></label><label>Observation<textarea rows={6} value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Describe routines, behavior, needs, or progress..." /></label><button className="primary-button" onClick={() => void saveNote()}><Send size={16} /> Save note</button></section><section className="note-feed">{notes.map((note) => <article key={note.id}><div><span>{note.noteType}</span><time>{note.createdAt.toLocaleDateString()}</time></div><p>{note.body}</p><footer>{pets.find((pet) => pet.id === note.petId)?.name ?? 'Pet'} · {note.sourceLabel}</footer></article>)}</section></div>}
    {showAdd && <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}><form className="modal" onSubmit={(event) => void addPet(event)} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">New intake</span><h2>Add an adoptable pet</h2></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)}>×</button></header><div className="form-grid"><label>Name<input name="name" required /></label><label>Species<select name="species"><option>Dog</option><option>Cat</option><option>Rabbit</option></select></label><label>Breed<input name="breed" required /></label><label>Age<input name="age" type="number" min="0" required /></label><label>Size<select name="size"><option>Small</option><option>Medium</option><option>Large</option></select></label><label>Energy<select name="energy"><option>Low</option><option>Medium</option><option>High</option></select></label><label className="full">Bio<textarea name="bio" rows={4} required /></label></div><footer><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" type="submit">Add to inventory</button></footer></form></div>}
  </div>;
}

function InsightsView({ pets }: { pets: PetRecord[] }) {
  const total = pets.reduce((sum, pet) => sum + pet.recommendationCount, 0); const overlooked = [...pets].sort((a, b) => a.recommendationCount - b.recommendationCount).slice(0, 3);
  return <div className="view"><ViewHeader eyebrow="Adoption intelligence" title="From recommendation to forever home" copy="Understand demand, uncover pets who need visibility, and track whether matches become successful placements." action={<span className="date-filter">Last 90 days</span>} />
    <section className="metric-grid"><Metric icon={<Users />} label="Profiles submitted" value="1,284" change="+18.6%" /><Metric icon={<Sparkles />} label="Matches generated" value={total.toLocaleString()} change="+24.2%" /><Metric icon={<Send />} label="Applications started" value="319" change="+12.1%" /><Metric icon={<Heart />} label="Successful adoptions" value="86" change="+9.4%" /></section>
    <section className="dashboard-grid"><article className="dashboard-panel funnel"><header><div><span className="eyebrow">Conversion</span><h2>Adoption funnel</h2></div><BarChart3 size={20} /></header>{[['Lifestyle profiles',1284,100],['Pet profiles viewed',876,68],['Applications started',319,25],['Meet-and-greets',142,11],['Adoptions completed',86,7]].map(([label,value,width]) => <div className="funnel-row" key={String(label)}><span>{label}</span><div><i style={{width:`${width}%`}} /></div><strong>{value.toLocaleString()}</strong></div>)}</article>
      <article className="dashboard-panel traits"><header><div><span className="eyebrow">Demand signals</span><h2>Most requested traits</h2></div><Search size={20} /></header>{[['Good with kids',72],['Calm temperament',64],['Apartment friendly',58],['Good with pets',43],['Low energy',36]].map(([label,value],index) => <div className="trait-rank" key={String(label)}><span>{index+1}</span><strong>{label}</strong><div><i style={{width:`${value}%`}} /></div><small>{value}%</small></div>)}</article>
      <article className="dashboard-panel overlooked"><header><div><span className="eyebrow">Needs attention</span><h2>Overlooked pets</h2></div><AlertTriangle size={20} /></header>{overlooked.map((pet) => <div className="overlooked-row" key={pet.id}><img src={pet.imageUrl} alt="" /><span><strong>{pet.name}</strong><small>{pet.breed} · {pet.ageYears} years</small></span><div><strong>{pet.recommendationCount}</strong><small>recommendations</small></div><ChevronRight size={17} /></div>)}</article>
      <article className="dashboard-panel success"><header><div><span className="eyebrow">Placement quality</span><h2>Match success over time</h2></div><CircleGauge size={20} /></header><div className="success-number"><strong>78%</strong><span>90-day placement success</span><small>+6.2 points from prior period</small></div><div className="line-chart"><svg viewBox="0 0 520 150" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#087f5b" stopOpacity=".22"/><stop offset="1" stopColor="#087f5b" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 122 C70 119 78 94 150 98 S240 79 300 82 S380 57 430 61 S485 35 520 29 L520 150 L0 150Z"/><path className="line" d="M0 122 C70 119 78 94 150 98 S240 79 300 82 S380 57 430 61 S485 35 520 29"/></svg><div><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></div></article>
    </section>
  </div>;
}

function Metric({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change: string }) {
  return <article className="metric"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{change} <small>vs prior period</small></em></div></article>;
}