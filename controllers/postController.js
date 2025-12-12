const Post = require('../models/Post');
const Connection = require('../models/Connection');

// Create post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    
    // Validate that either content or image exists
    if (!content?.trim() && !image) {
      return res.status(400).json({ message: 'Post must have either content or image' });
    }
    
    const post = new Post({
      author: req.userId,
      content: content || '', // Allow empty content if image exists
      image
    });
    await post.save();
    await post.populate('author', 'name profilePicture city');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get feed posts (bandmates only)
const getFeed = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.userId, status: 'accepted' },
        { recipient: req.userId, status: 'accepted' }
      ]
    });
    
    const bandmateIds = connections.map(conn => 
      conn.requester.toString() === req.userId ? conn.recipient : conn.requester
    );
    
    const posts = await Post.find({ author: { $in: bandmateIds } })
      .populate('author', 'name profilePicture city instruments genres')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const isLiked = post.likes.includes(req.userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    
    await post.save();
    res.json({ liked: !isLiked, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({
      user: req.userId,
      text
    });
    await post.save();
    await post.populate('comments.user', 'name');
    res.json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit post
const editPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    
    post.content = content;
    if (image !== undefined) post.image = image;
    
    await post.save();
    await post.populate('author', 'name profilePicture city');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getFeed, likePost, addComment, editPost, deletePost };