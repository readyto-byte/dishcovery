import { useEffect, useState } from "react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

const HistoryPage = () => {
  const [historyRecipes, setHistoryRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getRelativeViewedTime = (isoDate) => {
    if (!isoDate) return "recently";
    const now = new Date();
    const viewedAt = new Date(isoDate);
    const diffMs = now - viewedAt;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < hour) {
      const mins = Math.max(1, Math.floor(diffMs / minute));
      return `${mins} min ago`;
    }
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffMs < week) {
      const days = Math.floor(diffMs / day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    const weeks = Math.floor(diffMs / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  };

  const parseOutputResponse = (outputResponse) => {
    if (!outputResponse) return null;
    if (typeof outputResponse === "object") return outputResponse;
    if (typeof outputResponse === "string") {
      try {
        return JSON.parse(outputResponse);
      } catch {
        return null;
      }
    }
    return null;
  };

  const mapHistoryToUi = (item) => {
    const parsed = parseOutputResponse(item.output_response);
    const firstSuggestion = parsed?.suggestions?.[0] || {};
    const estimatedTime = parsed?.estimatedTime || "N/A";

    return {
      id: item.id,
      title: firstSuggestion.title || item.search_query || "Generated Recipe",
      type: item.source_api === "cache" ? "Cached Recipe" : "AI Generated",
      difficulty: "Medium",
      time: estimatedTime,
      servings: firstSuggestion.servings || "-",
      viewed: getRelativeViewedTime(item.searched_date),
      tags: ["history", "dishcovery", item.source_api || "recipe"],
      searchQuery: item.search_query,
      output: parsed,
    };
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiCall("/api/history");
        const rows = Array.isArray(response?.data) ? response.data : [];
        setHistoryRecipes(rows.map(mapHistoryToUi));
      } catch (err) {
        setError(err.message || "Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleViewRecipe = (id) => {
    const recipe = historyRecipes.find((row) => row.id === id);
    if (!recipe) return;
    alert(
      `Search: ${recipe.searchQuery || "N/A"}\n\n` +
      `Recipe: ${recipe.title}\n` +
      `Estimated time: ${recipe.time}`
    );
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire recipe history?")) {
      alert("Clear history endpoint is not set up yet.");
    }
  };

  return (
    <div className="pb-12">
      {/* History Header */}
      <div
        className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-5">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              Recipe <span className="text-[#B5D098]">History</span>
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">
              All recipes you've viewed ({historyRecipes.length} total)
            </p>
          </div>
          <button
            onClick={handleClearHistory}
            className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md"
          >
            <i className="fas fa-trash-alt mr-2"></i> Clear History
          </button>
        </div>
      </div>

      <div className="mx-4 md:mx-8">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl bg-white/70 px-4 py-5 text-sm text-[#2d3f1a]">Loading history...</div>
        ) : null}

        {!isLoading && historyRecipes.length === 0 ? (
          <div className="rounded-xl bg-white/70 px-4 py-5 text-sm text-[#2d3f1a]">
            No generated recipes in history yet. Create a recipe to see it here.
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="history-card bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-12 bg-[#587A34] flex items-center justify-end px-4">
                <div className="bg-[#95A131] rounded-full px-3 py-1 text-xs font-bold text-white">
                  Viewed {recipe.viewed}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-[#32491B]">{recipe.title}</h3>
                <p className="text-black/60 text-sm mt-1">{recipe.type} • {recipe.difficulty}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {recipe.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#839705]/20 text-[#32491B] px-2 py-0.5 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#B5D098]/30">
                  <div className="flex gap-3 text-sm text-black/60">
                    <span><i className="far fa-clock"></i> {recipe.time}</span>
                    <span><i className="fas fa-users"></i> {recipe.servings}</span>
                  </div>
                  <button
                    onClick={() => handleViewRecipe(recipe.id)}
                    className="text-[#587A34] hover:text-[#32491B] font-semibold text-sm transition-all"
                  >
                    View Recipe <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;