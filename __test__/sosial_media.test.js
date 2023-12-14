const request = require("supertest");
const {describe, it, expect, afterAll, beforeAll} = require("@jest/globals");
const app = require("../bin/express");
const {User, SocialMedia} = require("../models");
const {sign_token} = require("../lib/crypto");
const testSocmed = {
    name: "unit test",
    social_media_url: "https://unittest.com/unittest"
}

let userToken = "";
let wrongToken = "";
let socmedId = 0;
beforeAll(async () => {
    const newUser = await User.create({
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
    userToken = await sign_token({id: newUser.id});
    wrongToken = await sign_token({id: wrongUser.id});
});

describe('POST social_media create', () => {
    it('should be success', (done) => {
        request(app)
            .post("/socialmedias")
            .set("token", userToken)
            .send(testSocmed)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("social_media");
                expect(res.body["social_media"]).toHaveProperty("name");
                expect(res.body["social_media"]["name"]).toBe(testSocmed.name);
                expect(res.body["social_media"]).toHaveProperty("UserId");
                expect(res.body["social_media"]).toHaveProperty("social_media_url");
                expect(res.body["social_media"].social_media_url).toBe(testSocmed.social_media_url);
                socmedId = res.body["social_media"].id;
                done();
            });
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .post("/socialmedias")
            .send(testSocmed)
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
            .post("/socialmedias")
            .set("token", userToken)
            .send({...testSocmed, social_media_url: undefined})
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(400);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toHaveLength(1);
                expect(res.body.message[0].path).toBe("social_media_url");
                done();
            });
    });
});

describe('GET social_media get all', () => {
    it('should be success', (done) => {
        request(app)
            .get("/socialmedias")
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("social_medias");
                expect(res.body["social_medias"]).toHaveLength(1);
                expect(res.body["social_medias"][0]).toHaveProperty("User");
                expect(res.body["social_medias"][0]).toHaveProperty("UserId");
                expect(res.body["social_medias"][0]["User"].id).toBe(res.body["social_medias"][0]["UserId"]);
                expect(res.body["social_medias"][0]).toHaveProperty("social_media_url");
                done();
            })
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .get("/socialmedias")
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            })
    });
});

describe('PUT social_media update', () => {
    it('should be success', (done) => {
        request(app)
            .put(`/socialmedias/${socmedId}`)
            .set("token", userToken)
            .send({
                ...testSocmed,
                social_media_url: "https://newurl.com"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("social_media");
                expect(res.body["social_media"]).toHaveProperty("social_media_url");
                expect(res.body["social_media"]["social_media_url"]).toBe("https://newurl.com");
                expect(res.body["social_media"]).toHaveProperty("createdAt");
                expect(res.body["social_media"]).toHaveProperty("updatedAt");
                expect(new Date(res.body["social_media"]["updatedAt"]).getTime()).toBeGreaterThan(new Date(res.body["social_media"]["createdAt"]).getTime())
                done();
            })
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .put(`/socialmedias/${socmedId}`)
            .send({
                ...testSocmed,
                social_media_url: "https://newurl.com"
            })
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .put(`/socialmedias/${socmedId}`)
            .set("token", wrongToken)
            .send({
                ...testSocmed,
                social_media_url: "https://newurl.com"
            })
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .put(`/socialmedias/${socmedId + 1}`)
            .set("token", userToken)
            .send({
                ...testSocmed,
                social_media_url: "https://newurl.com"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("social media not found");
                done();
            });
    });
});

describe('DELETE comment delete', () => {
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .delete(`/socialmedias/${socmedId}`)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .delete(`/socialmedias/${socmedId}`)
            .set("token", wrongToken)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .delete(`/socialmedias/${socmedId + 1}`)
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("social media not found");
                done();
            });
    });
    it('should be success', (done) => {
        request(app)
            .delete(`/socialmedias/${socmedId}`)
            .set("token", userToken)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).toBe(200);
                expect(Object.keys(res.body)).toHaveLength(1);
                expect(res.body).toHaveProperty("message");
                expect(typeof res.body.message).toBe("string");
                expect(res.body.message).toBe("Your social media has been successfully deleted");
                done();
            });
    });
});

afterAll(async () => {
    await SocialMedia.destroy({where:{}});
    await User.destroy({where: {}});
});