const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();

const firebase = require('firebase');
const firebaseConfig = config.firebase;

describe('Email', () => {
    describe('POST /email', () => {
        it('이메일 저장을 완료하면 true를 리턴한다', done => {
            request.post('/email')
                .send({
                    email: 'email@appbee.com',
                    isActive: true,
                })
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);
                    done();
                }).catch(err => done(err));
        });

        afterEach((done) => {
            if(!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            firebase.database().ref('emails').once('value', function(snapShot) {
                snapShot.forEach(function(childSnapshot) {
                    if(childSnapshot.val().email === 'email@appbee.com') {
                        const key = childSnapshot.key;
                        firebase.database().ref('emails/' + key).remove();
                    }
                });
                done();
            })


        });
    });
});
