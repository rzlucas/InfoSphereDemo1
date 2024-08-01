import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ArticleCard from '../components/ArticleCard';
import NewsSearch from '../components/NewsSearch';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleArticles, setVisibleArticles] = useState(3); // Número de artículos visibles
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchArticlesAndCategories = async () => {
      setLoading(true);
      setError('');

      try {
        const articlesData = [];
        const categoriesData = [];

        // Fetch all articles with pagination
        let page = 1;
        let hasMore = true;
        while (hasMore) {
          const response = await api.get('/infosphere/articles/', {
            params: { page, page_size: 100 },
          });
          articlesData.push(...response.data.results);
          hasMore = !!response.data.next;
          page += 1;
        }

        // Fetch all categories assignments with pagination
        page = 1;
        hasMore = true;
        while (hasMore) {
          const response = await api.get('/infosphere/article-categories/', {
            params: { page, page_size: 100 },
          });
          categoriesData.push(...response.data.results);
          hasMore = !!response.data.next;
          page += 1;
        }

        // Fetch all categories
        const allCategoriesResponse = await api.get('/infosphere/categories/');
        const allCategoriesData = allCategoriesResponse.data.results;

        // Map category IDs to category names
        const categoryNamesMap = allCategoriesData.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});

        // Map articles to their categories
        const categoriesMap = categoriesData.reduce((acc, assignment) => {
          if (!acc[assignment.article]) {
            acc[assignment.article] = [];
          }
          acc[assignment.article].push(categoryNamesMap[assignment.category]);
          return acc;
        }, {});

        // Add category names to articles
        const articlesWithCategory = articlesData.map(article => ({
          ...article,
          categories: categoriesMap[article.id] || ['Unknown category'],
        }));

        // Ordenar artículos por fecha de creación
        articlesWithCategory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setArticles(articlesWithCategory);
        setSearchResults(articlesWithCategory);

        // Set unique categories
        const uniqueCategories = Array.from(new Set(allCategoriesData.map(category => ({
          id: category.id,
          name: category.name,
        }))));
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to fetch articles and categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticlesAndCategories();
  }, []);

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter(article => article.id !== id));
    setSearchResults(searchResults.filter(article => article.id !== id));
  };

  const handleShowMore = () => {
    setVisibleArticles(visibleArticles + 3);
  };

  const handleSearch = (query, selectedCategory) => {
    let filteredArticles = articles;

    if (query) {
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredArticles = filteredArticles.filter(article =>
        article.categories.includes(selectedCategory)
      );
    }

    setSearchResults(filteredArticles);
  };

  return (
    <div className="container">
      <NewsSearch categories={categories} onSearch={handleSearch} />
      {loading && <div>Loading articles...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="articles-container">
        {!loading && !error && searchResults.slice(0, visibleArticles).map(article => (
          <ArticleCard key={article.id} article={article} onDelete={handleDeleteArticle} />
        ))}
      </div>
      {!loading && !error && visibleArticles < searchResults.length && (
        <button onClick={handleShowMore} className="show-more-button">
          Show More
        </button>
      )}
    </div>
  );
};

export default Home;
