import { useEffect, useState } from 'react';
import { addComment, getCommentsByPost, getUsernameById } from '../api'; 
import { Button, Form, ListGroup, Spinner } from 'react-bootstrap';

interface Comment {
  _id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface CommentsSectionProps {
  postId: string;
  currentUserId: string; 
  incrementCommentsCount: () => void; // פונקציה להגדלת כמות התגובות
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, incrementCommentsCount }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({}); 
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentsByPost(postId);
      const commentsData = response.data as Comment[];
      setComments(commentsData);

      // השגת שמות משתמשים לכל התגובות
      const uniqueUserIds = [...new Set(commentsData.map(comment => comment.userId))];
      const usernamesMap: { [key: string]: string } = {};

      await Promise.all(uniqueUserIds.map(async (userId) => {
        try {
          const res = await getUsernameById(userId);
          usernamesMap[userId] = (res.data as { username: string }).username;
        } catch {
          usernamesMap[userId] = 'Unknown';
        }
      }));

      setUsernames(usernamesMap);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('לא ניתן להעלות תגובה ריקה');
      return;
    }
    if (newComment.length > 200) {
      alert('התגובה לא יכולה להיות ארוכה מ-200 תווים');
      return;
    }

    try {
      setSubmitting(true);
      const commentData = { content: newComment, postId };
      await addComment(commentData);

      setNewComment('');
      fetchComments();
      incrementCommentsCount(); // הגדלת מונה התגובות בתצוגה
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-section mt-4">
      <h4>Comments:</h4>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup style={{ maxWidth: '600px', wordWrap: 'break-word' }}>
          {comments.map((comment) => (
            <ListGroup.Item key={comment._id}>
              <strong>{usernames[comment.userId] || 'Unknown'}:</strong> {comment.content}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Form className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}>
        <Form.Group controlId="newComment">
          <Form.Label>Add comment:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            maxLength={200}
            disabled={submitting}
          />
        </Form.Group>
        <Button  variant="primary" type="submit" className="mt-2" disabled={submitting}>
          {submitting ? 'Adding comment...' : 'Add comment'}
        </Button>
      </Form>
    </div>
  );
};

export default CommentsSection;
