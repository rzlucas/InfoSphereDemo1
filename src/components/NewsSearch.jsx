import React, { useState } from 'react';

const NewsSearch = ({ categories, onSearch }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, selectedCategory);
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for news by title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) && categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default NewsSearch;
