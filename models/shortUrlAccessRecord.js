const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShortUrl = require('./url');

shortUrlAccessRecordSchema = new Schema( {
	
    shortUrl: { type: mongoose.Types.ObjectId, ref: 'ShortUrl' },
	timeStamp: {
		type: Date,
		default: Date.now
	}
}),
ShortUrlAccessRecord = mongoose.model('ShortUrlAccessRecord', shortUrlAccessRecordSchema);

module.exports = ShortUrlAccessRecord;
