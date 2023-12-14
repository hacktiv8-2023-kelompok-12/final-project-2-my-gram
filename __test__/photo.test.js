const request = require("supertest");
const {describe, it, expect, afterAll, beforeAll} = require("@jest/globals");
const app = require("../bin/express");
const {User, Photo} = require("../models");
const {sign_token} = require("../lib/crypto");
const testPhoto = {
    title: "unit test photo",
    caption: "this is unit test",
    poster_image_url: "https://unittest.com/poster"
}

let userToken = "";
let wrongToken = "";
let photoId = 0;
beforeAll(async () => {
    const user = await User.create({
        email: "unittest@mail.com",
        full_name: "unit test",
        username: "unit_test",
        password: "unittest1234",
        profile_image_url: "https://image.com/unittest",
        age: 10,
        phone_number: "081234567890"
    });
    const wrongUser = await User.create({
        email: "wronguser@mail.com",
        full_name: "wrong user",
        username: "wrong_user",
        password: "wronguser1234",
        profile_image_url: "https://image.com/unittest",
        age: 10,
        phone_number: "081234567890"
    });
    userToken = await sign_token({id: user.id});
    wrongToken = await sign_token({id: wrongUser.id});
});

describe('POST photo create', () => {
    it('should be success', (done) => {
        request(app)
            .post("/photos")
            .set("token", userToken)
            .send(testPhoto)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("id");
                expect(res.body).toHaveProperty("title");
                expect(res.body.title).toBe(testPhoto.title);
                expect(res.body).toHaveProperty("caption");
                expect(res.body.caption).toBe(testPhoto.caption);
                photoId = res.body.id;
                done();
            });
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .post("/photos")
            .send(testPhoto)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [validation]', (done) => {
        request(app)
            .post("/photos")
            .set("token", userToken)
            .send({
                ...testPhoto,
                poster_image_url: "not a url"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(400);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toHaveLength(1);
                expect(res.body.message[0].path).toBe("poster_image_url");
                done();
            });
    });
});

describe('GET photo get all', () => {
    it('should be success', (done) => {
        request(app)
            .get("/photos")
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("photos");
                expect(res.body.photos).toHaveLength(1);
                expect(res.body.photos[0]).toHaveProperty("Comments");
                expect(res.body.photos[0]["Comments"]).toHaveLength(0);
                expect(res.body.photos[0]).toHaveProperty("User");
                done();
            })
    });
    it('should be failed', (done) => {
        request(app)
            .get("/photos")
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
});

describe('PUT photo update', () => {
    it('should be success', (done) => {
        request(app)
            .put(`/photos/${photoId}`)
            .set("token", userToken)
            .send({
                title: "unit test photo updated",
                caption: "this is unit test updated",
                poster_image_url: "https://unittest.com/poster"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("photo");
                expect(res.body.photo).toHaveProperty("title");
                expect(res.body.photo.title).toBe("unit test photo updated");
                expect(res.body.photo).toHaveProperty("caption");
                expect(res.body.photo.caption).toBe("this is unit test updated");
                done();
            });
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .put(`/photos/${photoId}`)
            .send({
                title: "unit test photo updated",
                caption: "this is unit test updated",
                poster_image_url: "https://unittest.com/poster"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [validation]', (done) => {
        request(app)
            .put(`/photos/${photoId}`)
            .set("token", userToken)
            .send({
                ...testPhoto,
                poster_image_url: "it is not a url"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(400);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toHaveLength(1);
                expect(res.body.message[0].path).toBe("poster_image_url");
                done();
            })
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .put(`/photos/${photoId + 1}`)
            .set("token", userToken)
            .send(testPhoto)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("photo not found");
                done();
            });
    });
});

describe('DELETE photo delete', () => {
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .delete(`/photos/${photoId}`)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .delete(`/photos/${photoId + 1}`)
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("photo not found");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .delete(`/photos/${photoId}`)
            .set("token", wrongToken)
            .end((err, res)=>{
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be success', (done) => {
        request(app)
            .delete(`/photos/${photoId}`)
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(Object.keys(res.body)).toHaveLength(1);
                expect(res.body).toHaveProperty("message");
                expect(typeof res.body.message).toBe("string");
                expect(res.body.message).toBe("Your photo has been successfully deleted");
                done();
            });
    });
});

afterAll(async () => {
    await Photo.destroy({where: {}});
    await User.destroy({where: {}});
})