import React, { useState, useEffect } from 'react';
import './SearchFilter.css';

interface ResearcherProfile {
  id: string;
  name: string;
  affiliation: string;
  expertise: string[];
  hIndex: number;
  publicationCount: number;
  region: string;
  institutionType: 'University' | 'Research Institute' | 'Company' | 'Other';
  fundingStatus: 'Funded' | 'Not Funded' | 'Unknown';
  isActive: boolean;
  summary: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterSettings;
  sortBy: SortOption;
}

interface FilterSettings {
  institutionTypes: Set<string>;
  fundingStatuses: Set<string>;
  regions: Set<string>;
  activeOnly: boolean;
}

type SortOption = 'relevance' | 'hIndexDesc' | 'pubCountDesc' | 'nameAsc';

const mockProfiles: ResearcherProfile[] = [
  {
    id: 'r1',
    name: 'Dr. Alice Johnson',
    affiliation: 'XYZ University',
    expertise: ['Artificial Intelligence', 'Machine Learning'],
    hIndex: 35,
    publicationCount: 120,
    region: 'North America',
    institutionType: 'University',
    fundingStatus: 'Funded',
    isActive: true,
    summary: 'Expert in AI and ML with focus on deep learning.'
  },
  {
    id: 'r2',
    name: 'Prof. Bob Lee',
    affiliation: 'Tech Research Institute',
    expertise: ['Computer Vision', 'Robotics'],
    hIndex: 40,
    publicationCount: 150,
    region: 'Europe',
    institutionType: 'Research Institute',
    fundingStatus: 'Not Funded',
    isActive: false,
    summary: 'Research on autonomous systems and robotics.'
  },
];

const institutionTypesAll = ['University', 'Research Institute', 'Company', 'Other'];
const fundingStatusesAll = ['Funded', 'Not Funded', 'Unknown'];
const regionsAll = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'];

const SearchFilter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterSettings>({
    institutionTypes: new Set(),
    fundingStatuses: new Set(),
    regions: new Set(),
    activeOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [results, setResults] = useState<ResearcherProfile[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchName, setSavedSearchName] = useState('');

  useEffect(() => {
    applySearch();
  }, [searchQuery, filters, sortBy]);

  const applySearch = () => {
    let filtered = mockProfiles.filter(profile => {
      const matchesQuery = 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        profile.affiliation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesInstitution = filters.institutionTypes.size === 0 || filters.institutionTypes.has(profile.institutionType);
      const matchesFunding = filters.fundingStatuses.size === 0 || filters.fundingStatuses.has(profile.fundingStatus);
      const matchesRegion = filters.regions.size === 0 || filters.regions.has(profile.region);
      const matchesActive = !filters.activeOnly || profile.isActive;

      return matchesQuery && matchesInstitution && matchesFunding && matchesRegion && matchesActive;
    });

    switch (sortBy) {
      case 'hIndexDesc':
        filtered = filtered.sort((a, b) => b.hIndex - a.hIndex);
        break;
      case 'pubCountDesc':
        filtered = filtered.sort((a, b) => b.publicationCount - a.publicationCount);
        break;
      case 'nameAsc':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        break;
    }

    setResults(filtered);
  };

  const toggleFilter = (key: keyof FilterSettings, value?: string) => {
    setFilters(prev => {
      const newFilters = { 
        ...prev,
        institutionTypes: new Set(prev.institutionTypes),
        fundingStatuses: new Set(prev.fundingStatuses),
        regions: new Set(prev.regions),
      };

      if (key === 'activeOnly') {
        newFilters.activeOnly = !newFilters.activeOnly;
      } else if (value) {
        if (newFilters[key].has(value)) {
          newFilters[key].delete(value);
        } else {
          newFilters[key].add(value);
        }
      }
      return newFilters;
    });
  };

  const toggleExpandFilter = (sectionName: string) => {
    setExpandedFilter(prev => (prev === sectionName ? null : sectionName));
  };

  const handleSaveSearch = () => {
    if (!savedSearchName.trim()) return;
    const newSaved: SavedSearch = {
      id: Date.now().toString(),
      name: savedSearchName.trim(),
      query: searchQuery,
      filters,
      sortBy
    };
    setSavedSearches([newSaved, ...savedSearches]);
    setSavedSearchName('');
  };

  const applySavedSearch = (saved: SavedSearch) => {
    setSearchQuery(saved.query);
    setFilters(saved.filters);
    setSortBy(saved.sortBy);
  };

  const exportResults = () => {
    const csvHeader = 'Name,Affiliation,Expertise,h-Index,Publication Count,Region,Institution Type,Funding Status,Active,Summary\n';
    const csvRows = results.map(p => [
      p.name,
      p.affiliation,
      `"${p.expertise.join('; ')}"`,
      p.hIndex,
      p.publicationCount,
      p.region,
      p.institutionType,
      p.fundingStatus,
      p.isActive ? 'Yes' : 'No',
      `"${p.summary}"`
    ].join(',')).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'search_results.csv');
    link.click();
  };

  return (
    <div className="app-main-background">
      <div className="search-filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search researchers, projects, affiliations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn" aria-label="Toggle Filters">
            {showFilters ? 'Filters ▲' : 'Filters ▼'}
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-section dropdown">
              <h4 className="dropdown-header" onClick={() => toggleExpandFilter('institutionTypes')}>
                Institution Type {expandedFilter === 'institutionTypes' ? '▲' : '▼'}
              </h4>
              {expandedFilter === 'institutionTypes' && (
                <div className="dropdown-content">
                  {institutionTypesAll.map(type => (
                    <label key={type} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.institutionTypes.has(type)}
                        onChange={() => toggleFilter('institutionTypes', type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-section dropdown">
              <h4 className="dropdown-header" onClick={() => toggleExpandFilter('fundingStatuses')}>
                Funding Status {expandedFilter === 'fundingStatuses' ? '▲' : '▼'}
              </h4>
              {expandedFilter === 'fundingStatuses' && (
                <div className="dropdown-content">
                  {fundingStatusesAll.map(status => (
                    <label key={status} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.fundingStatuses.has(status)}
                        onChange={() => toggleFilter('fundingStatuses', status)}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-section dropdown">
              <h4 className="dropdown-header" onClick={() => toggleExpandFilter('regions')}>
                Region {expandedFilter === 'regions' ? '▲' : '▼'}
              </h4>
              {expandedFilter === 'regions' && (
                <div className="dropdown-content">
                  {regionsAll.map(region => (
                    <label key={region} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.regions.has(region)}
                        onChange={() => toggleFilter('regions', region)}
                      />
                      {region}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-section active-only">
              <label>
                <input
                  type="checkbox"
                  checked={filters.activeOnly}
                  onChange={() => toggleFilter('activeOnly')}
                />
                Show Active Researchers Only
              </label>
            </div>

            <div className="sort-section">
              <label htmlFor="sort-select">Sort By: </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="relevance">Relevance</option>
                <option value="hIndexDesc">h-Index (High to Low)</option>
                <option value="pubCountDesc">Publication Count (High to Low)</option>
                <option value="nameAsc">Name (A to Z)</option>
              </select>
            </div>

            <div className="save-search-section">
              <input
                type="text"
                placeholder="Name this search"
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
                className="save-search-input"
              />
              <button 
                onClick={handleSaveSearch} 
                disabled={!savedSearchName.trim()} 
                className="save-search-btn"
              >
                Save Search
              </button>
            </div>
          </div>
        )}

        <div className="saved-searches">
          {savedSearches.length > 0 && <h4>Saved Searches</h4>}
          {savedSearches.map(search => (
            <button key={search.id} className="saved-search-chip" onClick={() => applySavedSearch(search)}>
              {search.name}
            </button>
          ))}
        </div>

        <div className="search-results">
          {results.length === 0 ? (
            <div className="no-results">No results found.</div>
          ) : (
            <>
              <div className="results-header">
                <h4>Search Results ({results.length})</h4>
                <button onClick={exportResults} className="export-btn" aria-label="Export results to CSV">
                  Export CSV
                </button>
              </div>
              <ul className="results-list">
                {results.map(profile => (
                  <li key={profile.id} className="result-item">
                    <h5>{profile.name}</h5>
                    <p><strong>Affiliation:</strong> {profile.affiliation}</p>
                    <p><strong>Expertise:</strong> {profile.expertise.join(', ')}</p>
                    <p><strong>h-Index:</strong> {profile.hIndex} | <strong>Publications:</strong> {profile.publicationCount}</p>
                    <p><strong>Region:</strong> {profile.region} | <strong>Institution:</strong> {profile.institutionType}</p>
                    <p><strong>Funding Status:</strong> {profile.fundingStatus} | <strong>Status:</strong> {profile.isActive ? 'Active' : 'Alumni'}</p>
                    <p className="summary">{profile.summary}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
