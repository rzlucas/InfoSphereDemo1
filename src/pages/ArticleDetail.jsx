import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from '../components/CommentForm';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/infosphere/articles/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setArticle(response.data);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to fetch article. Please try again later.');
      }
    };

    const fetchComments = async () => {
      try {
        const response = await api.get('/infosphere/comments/', {
          headers: {
            Authorization: `Token ${token}`,
          },
          params: { article: id },
        });
        setComments(response.data.results);
        fetchUserProfiles(response.data.results);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to fetch comments. Please try again later.');
      }
    };

    const fetchUserProfiles = async (comments) => {
      try {
        const userIds = comments.map(comment => comment.author);
        const uniqueUserIds = [...new Set(userIds)];

        const userProfilesPromises = uniqueUserIds.map(userId =>
          api.get(`/users/profiles/${userId}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          })
        );

        const profiles = await Promise.all(userProfilesPromises);

        const profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.data.user__id] = profile.data;
          return acc;
        }, {});

        setUserProfiles(profilesMap);
      } catch (err) {
        console.error('Failed to fetch user profiles:', err);
        setError('Failed to fetch user profiles. Please try again later.');
      }
    };

    fetchArticle();
    fetchComments();
  }, [id, token]);

  const handleCommentAdded = (comment) => {
    setComments([...comments, comment]);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/infosphere/comments/${commentId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const getAuthorName = (authorId) => {
    const user = userProfiles[authorId];
    return user ? `${user.first_name} ${user.last_name}` : `Unknown user (ID: ${authorId})`;
  };

  if (!article) return <div>Loading...</div>;

  return (
    <div className="article-container">
      <h1 className="article-title">{article.title}</h1>
      <div className="article-details">
        <span className="article-meta">{`Author: ${article.author}`}</span>
        <span className="article-meta">{`Created at: ${new Date(article.created_at).toLocaleDateString()}`}</span>
      </div>
      <p className="article-content">{article.content}</p>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <CommentForm articleId={id} onCommentAdded={handleCommentAdded} />
      <div>
        {comments.map(comment => (
          <div key={comment.id} style={{ marginBottom: '1rem', padding: '0.5rem', background: '#2c2c2c', borderRadius: '5px' }}>
            <p><strong>{getAuthorName(comment.author)}</strong>: {comment.content}</p>
            {comment.reaction && (
              <p><strong>Reaction:</strong> {comment.reaction}</p>
            )}
            <button onClick={() => handleDeleteComment(comment.id)} className="delete-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleDetail;
