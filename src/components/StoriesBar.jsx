import React, { useEffect, useMemo, useState } from "react";
import { getStories, uploadStory } from "../services/storyService";
import StoryViewer from "./StoryViewer";
import { API_BASE_URL } from "../config";

const resolveMediaUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://localhost:8080")) {
    return url.replace("http://localhost:8080", API_BASE_URL);
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load stories error:", error);
      setStories([]);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadStory(file);
      await loadStories();
    } catch (error) {
      console.error("Upload story error:", error);
      alert("Failed to upload story");
    }
  };

  const groupedStories = useMemo(() => {
    const map = new Map();

    stories.forEach((story) => {
      const key = story.userEmail || story.username || story.id;

      if (!map.has(key)) {
        map.set(key, {
          userKey: key,
          username: story.username,
          userEmail: story.userEmail,
          profileImageUrl: story.profileImageUrl,
          stories: [story],
        });
      } else {
        map.get(key).stories.push(story);
      }
    });

    return Array.from(map.values());
  }, [stories]);

  const openUserStories = (userGroup, index = 0) => {
    const normalizedStories = (userGroup.stories || []).map((story) => ({
      ...story,
      profileImageUrl: resolveMediaUrl(story.profileImageUrl),
      mediaUrl: resolveMediaUrl(story.mediaUrl),
    }));

    setSelectedUserStories(normalizedStories);
    setSelectedStoryIndex(index);
  };

  const closeViewer = () => {
    setSelectedUserStories([]);
    setSelectedStoryIndex(0);
  };

  return (
    <>
      <div className="stories-row">
        <label className="story-chip" style={{ cursor: "pointer" }}>
          <input type="file" hidden accept="image/*,video/*" onChange={handleUpload} />
          <div className="story-avatar">
            <div className="story-avatar-inner">+</div>
          </div>
          <div className="story-name">Add</div>
        </label>

        {groupedStories.map((group) => (
          <div
            className="story-chip"
            key={group.userKey}
            onClick={() => openUserStories(group, 0)}
            style={{ cursor: "pointer" }}
          >
            <div className="story-avatar">
              {group.profileImageUrl ? (
                <img
                  src={resolveMediaUrl(group.profileImageUrl)}
                  alt={group.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="story-avatar-inner">
                  {group.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="story-name">{group.username}</div>
          </div>
        ))}
      </div>

      {selectedUserStories.length > 0 && (
        <StoryViewer
          stories={selectedUserStories}
          currentIndex={selectedStoryIndex}
          onClose={closeViewer}
          onChangeIndex={setSelectedStoryIndex}
        />
      )}
    </>
  );
};

export default StoriesBar;