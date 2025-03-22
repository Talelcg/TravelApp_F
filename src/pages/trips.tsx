import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Dropdown,Button } from "react-bootstrap";
import { getUserById } from '../api';

import { getAllPosts, getUsernameById, deletePost, toggleLikePost } from "../api"; // added deletePost API function
import { FaEllipsisV, FaHeart } from "react-icons/fa";

interface Post {
  _id: string;
  title: string;
  content: string;
  userId: string;
  location: string;
  rating: number;
  images: string[];
  commentsCount: number;
  likes: string[];
  createdAt: string;
}

const Trips = () => {
  const [userDetails, setUserDetails] = useState<Record<string, { username: string; profileImage?: string }>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({}); // store image index for each post
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // store current user's ID
  const [sortByLikes, setSortByLikes] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts();
        const sortedPosts = (response.data as Post[]).sort((a: Post, b: Post) => {
          // מיון לפי תאריך יצירה מהחדש לישן
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setPosts(sortedPosts); // עדכון רשימת הפוסטים הממוינת
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set current user
    const storedUserId = localStorage.getItem("user");
    setCurrentUserId(storedUserId ? storedUserId.replace(/"/g, '') : null);

    fetchPosts();
  }, []);
  const handleSortByLikes = () => {
    setSortByLikes(!sortByLikes);
    setPosts((prevPosts) => [...prevPosts].sort((a, b) => (sortByLikes ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : b.likes.length - a.likes.length)));
  };
  const handleLikePost = async (postId: string) => {
    try {
      if (!currentUserId) {
        alert("Please log in to like posts.");
        return;
      }
      await toggleLikePost(postId); // call API function to toggle like
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(currentUserId)
                  ? post.likes.filter((id) => id !== currentUserId)
                  : [...post.likes, currentUserId],
              }
            : post
        )
      ); // update state after like/unlike
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Fetch username by userId
  const fetchUserDetails = async (userId: string) => {
    if (!userDetails[userId]) {
      try {
        const res = await getUserById(userId);
        setUserDetails((prev) => ({
          ...prev,
          [userId]: {
            username: res.data.username,
            profileImage: res.data.profileImage 
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
  

  // Change image index
  const handleNextImage = (postId: string, imagesLength: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % imagesLength,
    }));
  };

  const handlePrevImage = (postId: string, imagesLength: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + imagesLength) % imagesLength,
    }));
  };

  // Handle post edit
  const handleEdit = (postId: string) => {
    localStorage.setItem("selectedPostId", postId); // Save post ID to localStorage
    navigate("/edit-post"); // Navigate to edit page
  };

  const handleViewDetails = (postId: string) => {
    localStorage.setItem("selectedPostId", postId);
    navigate("/post"); 
  };

  // Handle post delete
  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId); // Call deletePost API function
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId)); // Update state to remove deleted post
      console.log(`Post ${postId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
   // Filter posts by search query
   const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (    <div className="trips-container">
    <h1 style={{ textAlign: "center" }}>Explore Trips</h1>
        {/* Search input */}
        <div className="text-center mb-3">
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ padding: "8px", width: "600px", maxWidth: "600px", marginBottom: "10px" }} // פה הוספתי width קבוע
        />
    </div>
    <div className="text-center mb-3">
      <Button onClick={handleSortByLikes} variant="warning">
        {sortByLikes ? "Sort by Date" : "Sort by popularity"}
      </Button>
    </div>
    {loading ? (
      <p style={{ textAlign: "center" }}>Loading...</p>
    ) : (
      <div className="trips-list">
        {posts.length === 0 ? (
          <p style={{ textAlign: "center" }}>No trips found</p>
        ) : (
            filteredPosts.map((post) => {
              if (!usernames[post.userId]) {
                fetchUserDetails(post.userId); // Fetch username if not already in state
              }

            // Set default image index if not already set
            if (!(post._id in imageIndex)) {
              setImageIndex((prev) => ({ ...prev, [post._id]: 0 }));
            }



            return (
              <Card
                key={post._id}
                className="shadow-sm border-0 rounded-lg overflow-hidden mt-5 p-3"
                style={{ maxWidth: "600px", margin: "0 auto" }}
              >
                <div
                  className="d-flex justify-content-between align-items-center text-muted"
                  style={{ fontSize: "0.9rem", marginBottom: "10px" }}
                >
                  <span>
                    {new Date(post.createdAt).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {/* Show Dropdown only if the logged-in user is the post author */}
                  {currentUserId === post.userId && (
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="secondary"
                        size="sm"
                        style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}
                      >
                        <FaEllipsisV style={{ color: "white" }} /> {/* Three dots icon */}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEdit(post._id)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDelete(post._id)}>Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>

                <div className="text-center">
                  <span className="d-flex justify-content-left text-muted" style={{ fontSize: "0.9rem" }}>
                    {post.location}
                  </span>
                </div>

                <div className="position-relative w-100 text-center">
                  {post.images.length > 0 && (
                    <div className="position-relative">
                      <img
                        src={post.images[imageIndex[post._id]]}
                        alt="Post"
                        className="img-fluid rounded"
                        style={{
                          width: "60%",
                          height: "auto",
                        }}
                      />
                      {post.images.length > 1 && (
                        <>
                          <button
                            className="position-absolute top-50 start-0 translate-middle-y btn"
                            onClick={() => handlePrevImage(post._id, post.images.length)}
                            style={{ left: "5px", backgroundColor: "#FF9800", color: "white" }}
                          >
                            ⏴
                          </button>

                          <button
                            className="position-absolute top-50 end-0 translate-middle-y btn "
                            onClick={() => handleNextImage(post._id, post.images.length)}
                            style={{ right: "5px", backgroundColor: "#FF9800", color: "white" }}
                          >
                            ⏵
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Card.Body>
                  <h5 className="text-center my-2">{post.title}</h5>
                  <p className="text-center">{post.content}</p>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img
                        src={userDetails[post.userId]?.profileImage}
                        alt="User"
                        style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                      />
                      <span>{userDetails[post.userId]?.username || "Loading..."}</span>
                  </div>


                  <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
                    <span>⭐ {post.rating} / 5</span>

                    <span
                      style={{ cursor: 'pointer' ,alignItems: "center", gap: "8px", display: "flex" }}
                      onClick={() => handleLikePost(post._id)} // Like post on click
                    >
                      <FaHeart
                        style={{
                          color: currentUserId && post.likes.includes(currentUserId) ? 'red' : 'gray', // Red if liked, gray if not
                          fontSize: '1.5rem',
                          
                          transition: 'color 0.3s', // optional transition for smooth change
                        }}
                      />
                      {post.likes.length}
                    </span>

                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewDetails(post._id)} // Navigate to post details on click
                    >
                      💬 {post.commentsCount}
                    </span>

                  </div>

                  <div className="d-flex justify-content-center mt-3">
                    <Link
                      to="/post"
                      className="btn w-auto"
                      style={{ backgroundColor: "#FF9800", color: "white" }}
                      onClick={() => handleViewDetails(post._id)}
                    >
                      View Details
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>
    )}
  </div>
);
};

export default Trips;