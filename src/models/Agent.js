const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/master', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const schema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    alias: '_id'
  },
  name: String,
  dead: Boolean,
  children: [{type: Schema.Types.ObjectId, ref: 'Agent'}],
});

class AgentSchema {
  get publicFields() {
    return ['id', 'name', 'dead', 'children']
  }

  toJSON() {
    const jsonData = {}
    this.publicFields.forEach(x => {
      jsonData[x] = this[x]
    })
    return jsonData;
  }
}

schema.loadClass(AgentSchema)
const Agent = mongoose.model('Agent', schema);

Agent.init().then(function() {
  this.publicFields = ['id', 'name', 'dead', 'children']
});

module.exports = Agent