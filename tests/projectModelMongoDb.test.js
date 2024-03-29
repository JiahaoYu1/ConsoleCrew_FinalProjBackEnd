require ('dotenv').config();
jest.setTimeout(5000);

const db = "Test_ProjectDB";

let mongod;
const model = require("../models/projectModelMongoDb");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { DatabaseError } = require("../models/DatabaseError");
const { InvalidInputError } = require("../models/InvalidInputErrors");

/**
 * Function that initializes the mock database for testing
 */
beforeAll(async () => {
    // This will create a new instance of "MongoMemoryServer" and automatically start it
    mongod = await MongoMemoryServer.create();
    console.log("Mock Database started");
});

/**
 * Function that initializes the model before each test
 */
beforeEach(async () => {
    const url = mongod.getUri();

    try {
        await model.initialize(db, true, url);
    } catch (err) {
        console.log(err.message)
    }
});

/**
 * Function that closes the model after each test
 */
afterEach(async () => {
    await model.close();
});

/**
 * Function that closes the database when done testing
 */
afterAll(async () => {
    await mongod.stop(); // Stop the MongoMemoryServer
    console.log("Mock Database stopped");
});

////////////////////////////////////
// TESTS FOR ADD PROJECT //
test('Can add Project Information to DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: 0};
    await model.addProject(id, title, desc, tag, userId)

    const cursor = await model.getProjectCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].id == id).toBe(true);
    expect(results[0].title.toLowerCase() == title.toLowerCase()).toBe(true);
    expect(results[0].description.toLowerCase() == desc.toLowerCase()).toBe(true);
    expect(results[0].tag == tag).toBe(true);
    expect(results[0].userId == userId).toBe(true);
});

test('Cannot add project with negative id parameter to DB', async () => {
    const { id, title, desc, tag, userId } = {id:-1, title: "project", desc: "description", tag: "test", userId: 0};
    await expect(() => model.addProject(id, title, desc, tag, userId)).rejects.toThrow();
});

test('Cannot add project with empty title parameter to DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "", desc: "description", tag: "test", userId: 0};
    await expect(() => model.addProject(id, title, desc, tag, userId)).rejects.toThrow();
});

test('Cannot add project with empty description parameter to DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "", tag: "test", userId: 0};
    await expect(() => model.addProject(id, title, desc, tag, userId)).rejects.toThrow();
});

test('Cannot add project with negative user id parameter to DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: -1};
    await expect(() => model.addProject(id, title, desc, tag, userId)).rejects.toThrow();
});

test('Cannot add project with empty tag parameter to DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "", userId: 0};
    await expect(() => model.addProject(id, title, desc, tag, userId)).rejects.toThrow();
});



////////////////////////////
// TESTS FOR READ PROJECT //
test('Can read Project from DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: 0};
    await model.addProject(id, title, desc, tag, userId)
    const cursor = await model.getProjectCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);

    const product = await model.getSingleProjectById(id);

    expect(product.id == id).toBe(true);
    expect(product.title.toLowerCase() == title.toLowerCase()).toBe(true);
    expect(product.description.toLowerCase() == desc.toLowerCase()).toBe(true);
    expect(product.tag == tag).toBe(true);
    expect(product.userId == userId).toBe(true);
});

test('Cannot read Project with empty name parameter from DB', async () => {
    await expect(() => model.getSingleProjectById("")).rejects.toThrow();
});

test('Cannot read Project with name that doesnt exist from DB', async () => {
    await expect(() => model.getSingleProjectById(0)).rejects.toThrow();
});

//////////////////////////////
// TEST FOR GET ALL PROJECT //
test('Reading all Project should throw error if empty', async () => {
    await expect(() => model.getAllProjects()).rejects.toThrow();
});

test('Reading all Project should return a list of items from DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: 0};
    await model.addProject(id, title, desc, tag, userId);

    const cursor = await model.getProjectCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    
    const product = await model.getAllProjects();

    expect(product.length == 1).toBe(true);
});

//////////////////////////////
// TESTS FOR UPDATE PROJECT //
test('Can update Project from DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: 0};
    const { newTitle, newDesc, newTag } = {newTitle: "updated project", newDesc: "updated description", newTag: "newTest"};
    await model.addProject(id, title, desc, tag, userId)

    await model.updateProject(id, newTitle, newDesc, newTag);

    const cursor = await model.getProjectCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);

    expect(results[0].title.toLowerCase() == newTitle.toLowerCase()).toBe(true);
    expect(results[0].description.toLowerCase() == newDesc.toLowerCase()).toBe(true);
    expect(results[0].tag.toLowerCase()).toBe(newTag.toLowerCase());
});

test('Cannot update Project with an empty id parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "updated description", newCatId: 1, newGenre: 1};

    await expect(() => model.updateProject("", newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with an empty new title parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "", newDesc: "updated description", newCatId: 1, newGenre: 1};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with an empty new description parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "", newCatId: 1, newGenre: 1};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with an empty new category id parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "updated description", newCatId: "", newGenre: 1};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with an empty new genre parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "updated description", newCatId: 1, newGenre: ""};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with a negative new category id parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "updated description", newCatId: -1, newGenre: 1};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

test('Cannot update Project with a negative new genre id parameter', async () => {
    const { id, title, desc, catId, genre, userId } = {id:0, title: "project", desc: "description", catId: 0, genre: 0, userId: 0};
    const { newTitle, newDesc, newCatId, newGenre } = {newTitle: "updated project", newDesc: "updated description", newCatId: 1, newGenre: -1};

    await expect(() => model.updateProject(id, newTitle, newDesc, newCatId, newGenre)).rejects.toThrow();
});

//////////////////////////////
// TESTS FOR DELETE PROJECT //
test('Can delete Project Information from DB', async () => {
    const { id, title, desc, tag, userId } = {id:0, title: "project", desc: "description", tag: "test", userId: 0};
    await model.addProject(id, title, desc, tag, userId)
    let cursor = await model.getProjectCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    await model.deleteProject(id);

    cursor = await model.getProjectCollection().find();
    results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('Cannot use delete Project command with empty name parameter', async () => {
    await expect(() => model.deleteProject("")).rejects.toThrow();
});

test('Cannot use delete Project command project that doesnt exist', async () => {
    await expect(() => model.deleteProject("non-existant name")).rejects.toThrow();
});