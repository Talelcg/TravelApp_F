import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addPost } from '../api';
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/UploadPost.css";

const UploadPost: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]); 
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);  
  const navigate = useNavigate();

  const getShortLocation = (address: any) => {
    const city = address.city || address.town || address.village;
    const country = address.country;
    return city && country ? `${city}, ${country}` : city || country || "Unknown location";
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: value,
            format: "json",
            addressdetails: 1,
            limit: 5,
          },
        });

        const locationSuggestions = (response.data as any[]).map((item: any) => {
          return getShortLocation(item.address);
        });

        setSuggestions(locationSuggestions);
        setIsSuggestionsOpen(true); 
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleLocationSelect = (suggestion: string) => {
    setLocation(suggestion);
    setSuggestions([]);  
    setIsSuggestionsOpen(false);  
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length <= 5) {
        setImages((prevImages) => [...prevImages, ...selectedFiles]);
      } else {
        alert("You can upload up to 5 images.");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Trim values to remove any leading/trailing spaces
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedLocation = location.trim();

    // Check if any required field is empty or contains only spaces
    if (!trimmedTitle || !trimmedContent || !trimmedLocation) {
      alert("All fields must be filled out properly. Please remove any empty spaces.");
      return false;
    }

    if (rating === 0) {
      alert("Please rate your experience before submitting.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Exit if form validation fails
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("location", location);
    formData.append("rating", rating.toString());
    
    images.forEach((image) => {
      formData.append("images", image); // הוספת כל קובץ לתוך formData
    });
  
    try {
      await addPost(formData);
      setUploadSuccess(true);
      setTimeout(() => {
        navigate("/trips");
      }, 1000);
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Error uploading post");
    }
  };
  
  const getRatingLabel = () => {
    if (rating === 5) return "Amazing 🌟";
    if (rating === 4) return "Great 😊";
    if (rating === 3) return "Nice 😐";
    if (rating === 2) return "Not great 😔";
    if (rating === 1) return "Disappointing 😞";
    return "";
  };

  return (
    <div className="upload-post-container mt-2">
      <h1 style={{ textAlign: "center" }}>Upload New Post</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              id="location"
              placeholder="Enter location"
              value={location}
              onChange={handleLocationChange}
              required
            />
            {isSuggestionsOpen && suggestions.length > 0 && (
              <ul className="list-group mt-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Post Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">Post Content</label>
            <textarea
              className="form-control"
              id="content"
              rows={4}
              placeholder="Write your post here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Upload Images (up to 5)</label>
            <input
              type="file"
              className="form-control"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              multiple
            />
          </div>
          <div className="mb-3 d-flex flex-wrap">
            {images.map((image, index) => (
              <div key={index} className="position-relative me-2 mb-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="img-thumbnail"
                  width={100}
                  height={100}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  onClick={() => handleRemoveImage(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="mb-2">
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
          <button 
            type="submit" 
            className="btn w-100" 
            style={{ backgroundColor: "#FF9800", color: "white" }}
          >
            Submit Post
          </button>
        </form>

        {uploadSuccess && (
          <div className="alert alert-success mt-3" role="alert">
            Post uploaded successfully! Redirecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPost;
