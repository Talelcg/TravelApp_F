import { useEffect, useState } from 'react';
import { addComment, getCommentsByPost, getUserById } from '../api';
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
  incrementCommentsCount: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, incrementCommentsCount }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: { username: string; profileImage: string } }>({});
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchUserDetails = async (userId: string) => {
    if (!userDetails[userId]) {
      try {
        const res = await getUserById(userId);
        setUserDetails((prev) => ({
          ...prev,
          [userId]: {
            username: res.data.username,
            profileImage: res.data.profileImage || "/profile_pictures/default.png"
          }
        }));
      } catch {
        setUserDetails((prev) => ({
          ...prev,
          [userId]: {
            username: "Unknown",
            profileImage: "/profile_pictures/default.png"
          }
        }));
      }
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentsByPost(postId);
      const commentsData = response.data as Comment[];
      setComments(commentsData);

      const uniqueUserIds = [...new Set(commentsData.map((comment) => comment.userId))];
      await Promise.all(uniqueUserIds.map((userId) => fetchUserDetails(userId)));
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
      incrementCommentsCount();
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
            <ListGroup.Item key={comment._id} className="d-flex align-items-center gap-2">
              <img
                src={userDetails[comment.userId]?.profileImage || "/profile_pictures/default.png"}
                alt="User"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
              <div>
                <strong>{userDetails[comment.userId]?.username || "Unknown"}:</strong> {comment.content}
              </div>
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
        <Button variant="primary" type="submit" className="mt-2" disabled={submitting}>
          {submitting ? 'Adding comment...' : 'Add comment'}
        </Button>
      </Form>
    </div>
  );
};

export default CommentsSection;
