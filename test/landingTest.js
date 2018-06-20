const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();

const firebase = require('firebase');
const firebaseConfig = config.firebase;

describe('Landing', () => {
    describe('GET /notices', () => {
        const noticesData = {
            seq: -1,
            title: '타이틀',
            contents: '내용',
            date: 1234,
        };

        before((done) => {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            firebase.database().ref('notices').push(noticesData, (err) => {
                if (err) {
                    return res.status(500).json({error: err});
                }
                done();
            });
        });

        it('공지사항 리스트를 리턴한다', done => {
            request.get('/notices')
                .expect(200)
                .then(res => {
                    const testNotice = res.body.filter(item => item.seq === -1)[0];
                    testNotice.seq.should.be.eql(-1);
                    testNotice.title.should.be.eql('타이틀');
                    testNotice.contents.should.be.eql('내용');
                    testNotice.date.should.be.eql(1234);
                    done();
                }).catch(err => done(err));
        });

        after((done) => {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            firebase.database().ref('notices').once('value', (snapShot) => {
                snapShot.forEach((childSnapshot) => {
                    if (childSnapshot.val().seq === -1) {
                        firebase.database().ref('notices/' + childSnapshot.key).remove();
                    }
                });
                done();
            })
        });
    });
});
