import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { planTrip } from "../api"; // Ensure this path is correct or adjust it to the correct file location

const PlannerApi = () => {
  const [formData, setFormData] = useState({
    destination: "",
    duration: "1",
    interests: "",
  });
  const [tripPlan, setTripPlan] = useState<{ time: string; activity: string; description: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    const updatedValue = name === "duration" ? Math.max(1, Number(value)).toString() : value;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await planTrip({
        destination: formData.destination,
        duration: Number(formData.duration),
        interests: formData.interests,
      });
      const responseData = response.data as { candidates?: { content: { parts: { text: string }[] } }[] };
      
      if (responseData && responseData.candidates && responseData.candidates.length > 0) {
        const itineraryText = responseData.candidates[0].content.parts[0].text;
        const itinerary = parseItinerary(itineraryText);
        setTripPlan(itinerary);
      }
    } catch (error) {
      console.error("Error fetching trip plan:", error);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseItinerary = (text: string) => {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const tripPlan: { time: string; activity: string; description: string; }[] = [];
    
    let time = "", activity = "", description = "";

    lines.forEach(line => {
      // Remove unnecessary table separators or headers
      if (line.includes("|----------------------|") || line.includes("Day and Time") || line.includes("Time") || line.includes("Activity") || line.includes("Description")) return;

      // Check if line is part of the table and has data
      const tableMatch = line.match(/\| (.*?) \| (.*?) \| (.*?) \|/);
      if (tableMatch) {
        time = tableMatch[1].trim();
        activity = tableMatch[2].trim();
        description = tableMatch[3].trim();

        // Remove unnecessary stars or other symbols
        description = description.replace(/\*{1,}/g, ""); // Removes '*' characters
        description = description.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold text inside **

        tripPlan.push({ time, activity, description });
      }
    });

    return tripPlan;
  };

  const renderTripPlanTable = () => {
    if (!tripPlan) return null;

    return (
      <div className="mt-4">
        <h3 className="text-center text-success">Your Trip Plan 📍</h3>
        <table className="table table-striped table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Time</th>
              <th>Activity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {tripPlan.map((item, index) => (
              <tr key={index}>
                <td>{item.time}</td>
                <td>{item.activity}</td>
                <td dangerouslySetInnerHTML={{ __html: item.description }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="text-center text-primary">Smart Travel Planner 🛤️</h2>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Where do you want to travel?</label>
            <input
              type="text"
              name="destination"
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter destination"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">For how long?</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Number of days"
              min="1"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">What interests you?</label>
            <textarea
              name="interests"
              onChange={handleChange}
              required
              className="form-control"
              placeholder="For example: nature, museums, beaches..."
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Generating..." : "Generate Trip Plan"}
          </button>
          {loading && <p className="text-center text-muted mt-3">Fetching itinerary...</p>}
        </form>

        {tripPlan && renderTripPlanTable()}
      </div>
    </div>
  );
};

export default PlannerApi;
