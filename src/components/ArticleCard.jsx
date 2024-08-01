import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ArticleCard = ({ article, onDelete }) => {
  const { isAuthenticated, token, userProfile } = useAuth();
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    try {
      const response = await api.delete(`/infosphere/articles/${article.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.status === 204) {
        onDelete(article.id);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError('Article not found.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to delete this article.');
        } else {
          setError(`Failed to delete article: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        setError('Failed to delete article. Please try again later.');
      }
    }
  };

  return (
    <div className="card">
      <h2>{article.title}</h2>
      <p>{article.abstract}</p>
      <p><strong>Author:</strong> {article.author_name}</p>
      <p><strong>Created on:</strong> {new Date(article.created_at).toLocaleDateString()}</p>
      <p><strong>Categories:</strong> {article.categories.join(', ')}</p>
      <Link to={`/articles/${article.id}`} style={{ color: '#bb86fc' }}>Read more</Link>
      {isAuthenticated && article.author === userProfile.user__id && (
        <button onClick={handleDelete} className="delete-button">Delete</button>
      )}
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    </div>
  );
};

export default ArticleCard;
