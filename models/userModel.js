import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
    {
        name: { type: String, required: [true, 'Name is a required field'] },
        email: { type: String, required: [true, "Email is a required field"] },
        password: { type: String, required: [true, "Pass is a required field"] },
        // password:{type:String, required:[true,"PassWord is a required field"]},
        isAdmin: { type: Boolean, default: false },
        isVerificationProcess :{type:Boolean, default:false}
        // token: { type: String },
        // isVerified: { type: Boolean, default: false },
        // cart: [{
        //     productId: {
        //         type: Schema.Types.ObjectId,
        //         ref: 'Product',
        //     },
        //     qty:{type:String}
        // }]
    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User