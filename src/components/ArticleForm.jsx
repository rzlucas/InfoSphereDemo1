import React, { useState } from 'react';
import api from '../services/api';

const CommentForm = ({ articleId }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/infosphere/articles/${articleId}/comments/`, { content });
    setContent('');
    // refresh comments (optional)
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>
      <button type="submit">Comment</button>
    </form>
  );
};

export default CommentForm;
