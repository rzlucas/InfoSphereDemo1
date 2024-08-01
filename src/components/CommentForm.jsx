import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CommentForm = ({ articleId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState('');
  const [customReaction, setCustomReaction] = useState('');
  const [error, setError] = useState('');
  const { token, userProfile } = useAuth();

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await api.get('/infosphere/reactions/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setReactions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching reactions:', err);
      }
    };
    fetchReactions();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let reactionId = selectedReaction;

      if (!selectedReaction && customReaction) {
        const response = await api.post('/infosphere/reactions/', { name: customReaction }, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        reactionId = response.data.id;
      }

      const commentData = {
        content,
        article: articleId,
        reaction: reactionId,
      };

      const response = await api.post('/infosphere/comments/', commentData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setContent('');
      setSelectedReaction('');
      setCustomReaction('');
      onCommentAdded({
        ...response.data,
        author: userProfile.user__id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        reaction: reactionId ? response.data.reaction.name : customReaction,
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        id="comment-content"
        name="comment-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>
      <select
        id="comment-reaction"
        name="comment-reaction"
        value={selectedReaction}
        onChange={(e) => setSelectedReaction(e.target.value)}
      >
        <option value="">Select a reaction (optional)</option>
        {reactions.map((reaction) => (
          <option key={reaction.id} value={reaction.id}>
            {reaction.name}
          </option>
        ))}
      </select>
      <input
        id="custom-reaction"
        name="custom-reaction"
        type="text"
        placeholder="Or enter a custom reaction"
        value={customReaction}
        onChange={(e) => setCustomReaction(e.target.value)}
        disabled={selectedReaction} // Deshabilitar si se seleccionó una reacción existente
      />
      <button type="submit">Comment</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default CommentForm;
