function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.role){
    const mongoosePaginate = require('mongoose-paginate-v2');
    const idvalidator = require('mongoose-id-validator');
    const myCustomLabels = {
      totalDocs: 'itemCount',
      docs: 'data',
      limit: 'perPage',
      page: 'currentPage',
      nextPage: 'next',
      prevPage: 'prev',
      totalPages: 'pageCount',
      pagingCounter: 'slNo',
      meta: 'paginator',
    };
    mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
    const Schema = mongoose.Schema;
    const schema = new Schema(
      {
        name:{
          type:String,
          required:true
        },
        code:{
          type:String,
          required:true
        },
        weight:{
          type:Number,
          required:true
        },
        isActive:{ type:Boolean },
        isDeleted:{ type:Boolean },
        addedBy:{
          type:Schema.Types.ObjectId,
          ref:'user'
        }
      },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt' 
        } 
      }
    );
    
    schema.pre('save', async function (next) {
      this.isDeleted = false;
      this.isActive = true;
      next();
    });

    schema.pre('insertMany', async function (next, docs) {
      if (docs && docs.length){
        for (let index = 0; index < docs.length; index++) {
          const element = docs[index];
          element.isDeleted = false;
          element.isActive = true;
        }
      }
      next();
    });

    schema.method('toJSON', function () {
      const {
        __v, ...object 
      } = this.toObject({ virtuals:true });
      object.id = object._id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    const role = mongoose.model('role',schema,'role');
    return role;
  }
  else {
    return mongoose.models.role;
  }
}
module.exports = makeModel;