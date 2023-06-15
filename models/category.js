const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name:  {
    type: String,
    required: true
  },
  icon:  {
    type: String
  },
  color:  {
    type: String
  }
})

categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

categorySchema.set('toJSON', {
  virtuals: true
});

// categorySchema.method('toJSON', function () {
//   const { __v, _id, ...object } = this.toObject();
//   object.id = _id;
//   return object;
// });

exports.Category = mongoose.model('Category', categorySchema);
exports.categorySchema = categorySchema;