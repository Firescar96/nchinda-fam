const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nchindafamilytree', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
