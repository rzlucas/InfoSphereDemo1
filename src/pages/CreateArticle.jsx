import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateArticle = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/infosphere/categories/');
        if (Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();

    if (id) {
      const fetchArticle = async () => {
        try {
          const response = await api.get(`/infosphere/articles/${id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          const article = response.data;
          setTitle(article.title);
          setAbstract(article.abstract);
          setContent(article.content);
          setSelectedCategories(article.categories);
        } catch (error) {
          console.error('Failed to fetch article:', error);
          setError('Failed to fetch article. Please try again later.');
        }
      };
      fetchArticle();
    }
  }, [id, token]);

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedCategories(selected);
  };

  const handleAddCategory = async () => {
    setCategoryError('');
    if (!newCategory) return;

    try {
      const response = await api.post('/infosphere/categories/', { name: newCategory }, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCategories([...categories, response.data]);
      setSelectedCategories([...selectedCategories, response.data.id]);
      setNewCategory('');
    } catch (error) {
      console.error('Failed to add category:', error);
      setCategoryError('Failed to add category. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const articleData = { 
        title, 
        abstract, 
        content
      };

      let response;
      if (id) {
        // Update article
        response = await api.put(`/infosphere/articles/${id}/`, articleData, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        // Clear existing categories
        const existingCategories = await api.get(`/infosphere/articles/${id}/categories/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        await Promise.all(existingCategories.data.results.map(async category => {
          await api.delete(`/infosphere/articles/${id}/categories/${category.id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
        }));

        // Assign new categories to the article
        await Promise.all(selectedCategories.map(async categoryId => {
          await api.post(`/infosphere/articles/${id}/categories/`, { category: categoryId }, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
        }));
      } else {
        // Create new article
        response = await api.post('/infosphere/articles/', articleData, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const articleId = response.data.id;

        // Assign categories to the newly created article
        await Promise.all(selectedCategories.map(async categoryId => {
          await api.post(`/infosphere/articles/${articleId}/categories/`, { category: categoryId }, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
        }));

        navigate(`/articles/${articleId}`);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
      setError('Failed to save article. Please try again later.');
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: '#bb86fc' }}>{id ? 'Edit Article' : 'Create Article'}</h1>
      <form onSubmit={handleSubmit} className="card">
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          id="abstract"
          name="abstract"
          placeholder="Abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        ></textarea>
        <textarea
          id="content"
          name="content"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <select multiple id="categories" name="categories" value={selectedCategories} onChange={handleCategoryChange}>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div>
          <input
            id="new-category"
            name="new-category"
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="button" onClick={handleAddCategory}>Add Category</button>
          {categoryError && <div style={{ color: 'red' }}>{categoryError}</div>}
        </div>
        <button type="submit">{id ? 'Update' : 'Create'}</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default CreateArticle;
