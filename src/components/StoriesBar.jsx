import React, { useEffect, useMemo, useState } from "react";
import { getStories, uploadStory } from "../services/storyService";
import StoryViewer from "./StoryViewer";

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

  // ek user ek hi baar story bar me dikhe
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
    setSelectedUserStories(userGroup.stories || []);
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
                  src={group.profileImageUrl}
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