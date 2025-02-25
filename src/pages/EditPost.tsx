import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/UploadPost.css";

const EditPost: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setExistingImages] = useState<string[]>([]);
  const navigate = useNavigate();

  const postId = localStorage.getItem("selectedPostId");

  const getRatingLabel = () => {
    if (rating === 5) return "Amazing 🌟";
    if (rating === 4) return "Great 😊";
    if (rating === 3) return "Nice 😐";
    if (rating === 2) return "Not great 😔";
    if (rating === 1) return "Disappointing 😞";
    return "";
  };

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await getPostById(postId);
          const post = response.data as {
            title: string;
            content: string;
            location: string;
            rating: number;
            images: string[];
          };
          setTitle(post.title);
          setContent(post.content);
          setLocation(post.location);
          setRating(post.rating);
          setExistingImages(post.images || []);
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };
      fetchPost();
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please rate your experience before submitting.");
      return;
    }


    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("location", location);
    formData.append("rating", rating.toString());
    //formData.append("images", JSON.stringify(images));
    images.forEach(image => formData.append("images", image));
    try {
      if (postId) {
        console.log("FormData values:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }console.log("Title:", title);
  console.log("Content:", content);
  console.log("Location:", location);
  console.log("Rating:", rating);
  console.log("Images:", images);
  
        const response = await updatePost(postId, formData);
        console.log('Response data:', response.data);
        if (response.status === 200) {
          setTimeout(() => {
            navigate("/trips");
          }, 1000);
        }
      } else {
        alert("Error: Post ID is missing");
      }
    } catch (error) {
      alert("Error updating post");
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prevImages) => prevImages.filter((img) => img !== imageUrl));
  };

  return (
    <div className="upload-post-container mt-2">
      <h1 style={{ textAlign: "center" }}>Edit Post</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">City</label>
            <input type="text" className="form-control" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">Post Title</label>
            <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label htmlFor="content" className="form-label">Post Content</label>
            <textarea className="form-control" id="content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Rate Your Experience</label>
            <div className="d-flex align-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  className={`btn ${rating >= star ? "btn-warning" : "btn-outline-warning"} me-1`}
                  key={star}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              {rating > 0 && <span className="ms-3">{getRatingLabel()}</span>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Existing Images</label>
            <div className="d-flex flex-wrap">
              {images.map((image, index) => (
                <div key={index} className="position-relative me-2 mb-2">
                  <img src={image} alt="Existing" className="img-thumbnail" width={100} height={100} />
                  <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0" onClick={() => handleRemoveExistingImage(image)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">Update Post</button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
