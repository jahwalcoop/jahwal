var mongoose = require('mongoose')
    , Schema = mongoose.Schema  
    , db = mongoose.connect('mongodb://172.27.164.77/jahwal');
   //, db = mongoose.connect('mongodb://localhost:27017/jahwal');

var bcrypt = require('bcrypt')
    ,SALT_WORK_FACTOR = 10;

//Member Schema
var FundSchema = new Schema({
    DepositDate: Date,
    Method: String,
    Money: Number,
    ReduceMoney: Number,
    GroupName: String
});
var RepaySchema = new Schema({
    RepayDate: Date,
    Payment: Number,
    RepayGroupName: String,
    Interest: Number
});
var LoanSchema = new Schema({
    LoanType: String,
    LoanDate: Date,
    LoanExpDate: Date,
    LoanPeriod: String,
    LoanRate: Number,
    LoanMoney: Number,
    LoanUse: String,
    Principal: Number,
    Balance: Number,
    LoanGroupName: String,
    Repay: [ RepaySchema ]
});
//Group Schema
var GroupSchema = new Schema({
    GroupName: String,
    ContactName: String,
    GroupPhone: String
});

var MemberSchema = new Schema({
    Pid: String,
    Password: String,
    Name: String,
    Birthday: Date,
    CalendarType: String,
    Address: String,
    Phone: String,
    CellPhone: String,
    RegDate: Date,
    MemberType: String,
    MemberClass: String,
    Fee: Number,
    Note: String,
    Status: String,
    FundingMethod: String,
    PromisedMoney: Number,
    ZoneCode: String,
    ZoneName: String,
    ZoneContact: String,
    GroupName: String,
    GroupPhone: String,
    DropDate: Date,
    Fund: [ FundSchema ],
    Loan: [ LoanSchema ]
});

// Bcrypt middleware
MemberSchema.pre('save', function(next) {
    var user = this;
    console.log('save pre:--')
    if(!user.isModified('Password')) return next();

    console.log('save pre:'+user.Pid)
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.Password, salt, function(err, hash) {
            if(err) return next(err);
            user.Password = hash;
            console.log('save pre: becrypted')
            next();
        });
    });
});

// Password verification
MemberSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.Password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

// Password update
MemberSchema.methods.updatePassword = function(newPassword, cb) {
    var user = this;

    if(newPassword == undefined) return cb(null, null);

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return cb(err);

        bcrypt.hash(newPassword, salt, function(err, hash) {
            if(err) return cb(err);
            cb(null, hash);
        });
    });
};

var Member = mongoose.model('Member', MemberSchema);
var MemberRemoved = mongoose.model('MemberRemoved', MemberSchema);
var Fund = mongoose.model('Fund', FundSchema);

//Buy Schema
var BuySchema = new Schema({
    StDate: Date,
    Subject: String,
    Status: String,
    EdDate: Date,
    GroupName: String,
    Sales: Number,
    Bill: Number
});
//Zone Schema
var ZoneSchema = new Schema({
    Code: {type:String, required:true ,unique:true},
    Name: String,
    Contact: String,
    Address: String,
    Seq: Number,
    MoneyCut: Number,
    MembershipFee: Number,
    DefaultPw: String,
    Scope: String,
    DefaultMonth: Number,
    LoanTypes: [{LoanType:String}],
    LoanUses: [{LoanUse:String}],
    Group: [GroupSchema],
    Buy: [BuySchema]
});

var Zone = mongoose.model('Zone', ZoneSchema);

var AddressSchema = new Schema({
    PostNo: Number,
    SerialNo: Number,
    Province: String,
    City: String,
    Dong: String,
    Lee: String,
    Island: String,
    Building: String,
    Changed: Number,
    Address: String
})

var Address = mongoose.model('Address', AddressSchema);

MemberSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
LoanSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
RepaySchema.virtual('id').get(function () {
    return this._id.toHexString();
});
FundSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
GroupSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
BuySchema.virtual('id').get(function () {
    return this._id.toHexString();
});
ZoneSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
AddressSchema.virtual('id').get(function () {
    return this._id.toHexString();
});





