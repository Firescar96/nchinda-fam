import mongoose from 'mongoose';
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/master', {useNewUrlParser: true, useUnifiedTopology: true });

const Agent = mongoose.model('Agent', {
  _id: Schema.Types.ObjectId,
  name: String,
  dead: Boolean,
  children: [{type: Schema.Types.ObjectId, ref: 'Agent'}],
});


export default Agent