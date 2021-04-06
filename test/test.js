/* eslint-env mocha */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const texsrv = require('./../server/texsrv.js');

chai.use(chaiHttp);


const sampleText = "The Chig\u00FCire and the Wingman\r\nPoker beer in Bogota\r\n\r\nPreviously appeared on Roads & Kingdoms: https://roadsandkingdoms.com/2016/drink-eating-worlds-largest-rodent/\r\n\r\n\u00A92016 Darrin DuFord\r\n\r\nWhen I was preparing to eat a slab of the world\u2019s largest species of rodent, I knew I couldn\u2019t reach for just any beverage. It\u2019s a respect thing.\r\n\r\nI also knew that no previous encounter with guinea pigs, pacas, or any of the other petite edible rodents of Central and South America could have prepared me to properly honor the corpulent, web-footed, great dane-sized king of them all, the chig\u00FCire, better known as the capybara.\r\n\r\nI was sitting at a table spotlighted by a skylight in the boxy eastern flank of Bogota\u2019s Teusaquillo locality. The neighborhood\u2019s pragmatic concrete walls, near the bustle and gloom of Avenida Caracas, occasionally find themselves rescued by the work of the city\u2019s street muralists, but otherwise suffer quietly in their drabness. Inside, however, I felt uplifted and reassured knowing that the restaurant, Chig\u00FCire 53, had named itself after the animal barbecuing on the round, bell-like parrilla grill at the entrance. Thus, I\u2019d figured the chefs must know a thing or two about what drink goes with its signature dish. \r\n\r\nThe drink selection, resembling that of pretty much any other low-key eatery in Colombia, was dominated by beers such as Heineken, along with a few national beers that seemed to emulate the paleness of said ubiquitous import. There are now a few microbrews in Colombia, such as the German-styled offerings of Apostol and the hipster-friendly brews of Bogota Beer Company (who stencil their logo on the same Bogota walls as do street artists). But no micros appeared on the menu at Chig\u00FCire 53.\r\n\r\nSuch a selection made me recall a conversation I\u2019d had, several days earlier, with a professor of philosophy who teaches at a university in Medellin. He had been staying in the capital for the week. \u201CPeople in cities often lose their culture,\u201D he told me in a soft, almost mourning voice, referring to how people move to cities from other places, joining a cultural cacophany, drowning each other\u2019s competing culture out. And here I was in Bogota, about to dine on a creature brought in from the country\u2019s eastern lowlands over a hundred miles away, while considering beers manufactured by the country\u2019s largest brewery.\r\n\r\nColombia is not known for beer. Yet Colombian-made beer is ubiquitous in the country, in open-air ceviche stands and fine dining establishments alike. So what gives? As far as hydration goes, beer can be a safer choice than bottled water, as the latter\u2019s supposedly sealed plastic caps may or may not snap when they open, and thus may or may not give you the runs. And, especially on the coast, an easy-drinking beer refreshes and cools faster than an amber, funky-scented Belgian brew. So which national brand would it be?\r\n\r\nThat was when packaging took over. I\u2019d seen the memorable red and yellow signs, above entrances to bars and restaurants, with the words CERVEZA and POKER stacked atop one another. The words were usually flanked by slick illustrations of playing cards. Beer and poker: two elements for a fun night out. But I\u2019d quickly realized that they were the same element. Poker is the beer.\r\n\r\nWhat little corn-like sweetness I detected in the Poker, pronounced \u201CPoe-care\u201D in Colombia, turned to a faint bitterness, yet the beer contributed the only bitter hint to the crispness of the chig\u00FCire skin and the rodent\u2019s clean take on porkiness (it\u2019s a vegetarian animal, after all). Poker was a willing companion, a gastronomic wingman, thin on personality, the forgettable kind of beer that beer hobbyists dismiss. But the beer offered deference, enabling the chig\u00FCire to strut its stuff\u2014or swim, as the species is also wont to do in the marshes of the Colombian lowlands. Even in a zone of apparent culture loss, something else can be gained.\r\n\r\nThat made Poker a forgettable beer that I can\u2019t seem to forget.\r\n";


describe('Text body tests', () => {

	describe('OK 1: POST with textual corpus in body (no options given; text header will be processed)', () => {
		it('Should return JSON with statistics', (done) => {
			let body = {
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('wordCount').eql(642);
				res.body.should.have.property('sentenceCount').eql(31);
				res.body.should.have.property('avgWordsPerSentence').eql(21);
				res.body.should.have.property('sentenceLenStdDev');
				if(res.body['sentenceLenStdDev']) parseFloat(res.body['sentenceLenStdDev']).should.be.closeTo(13.09, 0.001);
				res.body.should.have.property('longestWords').deep.eql(["drink-eating-worlds-largest-rodent", "hipster-friendly", "establishments"]);
				res.body.should.have.property('longestWordLen').eql(34);
				res.body.should.have.property('maxWordFreq').deep.eql([
					[18, "of"],
					[16, "in"],
					[14, "and"]
				]);
				if(res.body['avgWordLength']) parseFloat(res.body['avgWordLength']).should.be.closeTo(5.161, 0.001);
				if(res.body['avgConseqSentLenDif']) parseFloat(res.body['avgConseqSentLenDif']).should.be.closeTo(16, 0.001);
				done();
			});
		});
	});
	
	
	describe('OK 2: POST with textual corpus in body (options)', () => {
		it('Should return JSON with statistics', (done) => {
			let body = {
				"skipFirst": 7,
				"omitWords": ["a", "an", "the", "of", "in", "on", "and", "to", "at", "or"],
				"maxDispWords": 3,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('wordCount').eql(636);
				res.body.should.have.property('sentenceCount').eql(31);
				res.body.should.have.property('avgWordsPerSentence').eql(21);
				res.body.should.have.property('sentenceLenStdDev');
				if(res.body['sentenceLenStdDev']) parseFloat(res.body['sentenceLenStdDev']).should.be.closeTo(12.99, 0.001);
				res.body.should.have.property('longestWords').deep.eql(["hipster-friendly", "colombian-made", "establishments"]);
				res.body.should.have.property('longestWordLen').eql(16);
				res.body.should.have.property('maxWordFreq').deep.eql([
					[12, "beer"],
					[9, "I"],
					[9, "that"]
				]);
				if(res.body['avgWordLength']) parseFloat(res.body['avgWordLength']).should.be.closeTo(5.571, 0.001);
				if(res.body['avgConseqSentLenDif']) parseFloat(res.body['avgConseqSentLenDif']).should.be.closeTo(15.80, 0.001);
				done();
			});
		});
	});
	
	
	describe('OK 3: POST with textual corpus in body (no omitWords; maxDispWords === 8)', () => {
		it('Should return JSON with statistics', (done) => {
			let body = {
				"skipFirst": 7,
				"maxDispWords": 8,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(true);
				res.body.should.have.property('wordCount').eql(636);
				res.body.should.have.property('sentenceCount').eql(31);
				res.body.should.have.property('avgWordsPerSentence').eql(21);
				res.body.should.have.property('sentenceLenStdDev');
				if(res.body['sentenceLenStdDev']) parseFloat(res.body['sentenceLenStdDev']).should.be.closeTo(12.99, 0.001);
				res.body.should.have.property('longestWords').deep.eql(["hipster-friendly","neighborhood’s","colombian-made","establishments","german-styled","easy-drinking","funky-scented","illustrations"]);
				res.body.should.have.property('longestWordLen').eql(16);
				res.body.should.have.property('maxWordFreq').deep.eql(
				  [[18,"of"],[16,"in"],[14,"and"],[12,"to"],[12,"beer"],[9,"I"],[9,"that"],[8,"as"]]
				);
				if(res.body['avgWordLength']) parseFloat(res.body['avgWordLength']).should.be.closeTo(5.115, 0.001);
				if(res.body['avgConseqSentLenDif']) parseFloat(res.body['avgConseqSentLenDif']).should.be.closeTo(15.80, 0.001);
				done();
			});
		});
	});
	
	
	// Error tests
	
	describe('Error 1: POST with missing text', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql("Bad parameters: Parameter 'text' is required.");
				done();
				
			});
		});
	});
	
	describe('Error 2: POST with empty text', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"text" : ""
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql("Bad parameters: Parameter 'text' is required.");
				done();
				
			});
		});
	});
	
	
	describe('Error 3: POST with negative maxDispWords', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"maxDispWords": -1,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql('Bad parameters: Parameter \'maxDispWords\' must be a positive number between 1 and 50.');
				done();	
			});
		});
	});
	
	describe('Error 4: POST with  maxDispWords  > 50', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"maxDispWords": 51,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql('Bad parameters: Parameter \'maxDispWords\' must be a positive number between 1 and 50.');
				done();	
			});
		});
	});
	
	
		describe('Error 5: POST with negative skipFirst', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"skipFirst": -1,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql('Bad parameters: Parameter \'skipFirst\' must be a positive number between 1 and 50.');
				done();	
			});
		});
	});
	
	describe('Error 6: POST with  skipFirst  > 50', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"skipFirst": 51,
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql('Bad parameters: Parameter \'skipFirst\' must be a positive number between 1 and 50.');
				done();	
			});
		});
	});
	
	describe('Error 7: POST with non-array omitWords', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = {
				"maxDispWords": 3,
				"omitWords":  {"words": ['a', 'the']},
				"text": sampleText
			};
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql("Bad parameters: Parameter 'omitWords' must be an array of strings.");
				done();	
			});
		});
	});
	
	describe('Error 8: POST with malformed JSON body', () => {
		it("Should return 'Bad parameters'", (done) => {
			let body = "hi there";
			chai.request(texsrv).post('/api/v1/textostats').send(body).end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql("Bad parameters: Parameter 'text' is required.");
				done();	
			});
		});
	});
	
	describe('Error 9: POST with unknown endpoint', () => {
		it("Should return 'Not Found'", (done) => {
			let body = "hi there";
			chai.request(texsrv).post('/api/v1/unknown').send(body).end((err, res) => {
				res.should.have.status(404);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(false);
				res.body.should.have.property('message').eql("Not found.");
				done();	
			});
		});
	});
});


