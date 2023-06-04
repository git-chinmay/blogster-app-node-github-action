const Page = require('./helpers/page');

let page;
beforeEach(async ()=>{
    page = await Page.build();
    // await page.goto('localhost:3000')
    await page.goto('http://localhost:3000'); //For running in Travis
});

afterEach(async ()=>{
    page.close();
})

// test("when logged in, can see blog create form", async ()=>{
//     await page.login();
//     await page.click('a.btn-floating');
//     const label = await page.getContentsOf('form label');
//     expect(lable).toEqual('Blog Title');
// });

describe("when logged in", async ()=>{
    // This beforeEach will only run for tests defined inside the this describe
    beforeEach(async ()=>{
        await page.login();
        await page.click('a.btn-floating');
    });

    test("can see blog create form", async ()=>{
        const label = await page.getContentsOf('form label');
        expect(lable).toEqual('Blog Title');
    });

    describe("And using valid inputs", async ()=>{
        // For entering valid input
        beforeEach(async ()=>{
            await page.type('.title input', 'My test title');
            await page.type('.content input', 'My test content');
            await page.click('form button'); //submit the form
        });


        test("Submitting takes user to review screen", async ()=>{
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test("Submitting then adds blog to inde page", async ()=>{
            await page.click('button.green');
            await page.waitFor('.card'); //wait for submit button data to send to server

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My test title');
            expect(content).toEqual('My test content');
        });
    });

    describe("And using invalid inputs", async ()=>{
        // Usually top beaforeEach should run but we need to submit without input
        // so new beforeeach
        beforeEach(async ()=>{
            await page.click('form button');
        });

        test("the form shows an error message", async ()=>{
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual("You must provide a value");
            expect(contentError).toEqual("You must provide a value");
        });
    })
});


describe("When not logged in", async () => {
    test("User can not create blog post.", async ()=>{
        
        const result = await page.evaluate(
            () => {

                return fetch("/api/blogs", {
                    method: "POST",
                    credentials: 'same-origin', //Adding any cookies avilable here bcz we are not gonna login to blog, we want to access without loggining in and we also want make api call as original as possible which has a cookie so use any cookies.
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'My Title',
                        content: 'My Content'
                    })
                }).then(res=>res.json());

            }
        );

        console.log(result);
        expect(result).toEqual({error:'You must log in!'});

    });

    test("User can not get a list of blog posts.", async ()=>{
        const result = await page.evaluate(

            () => {
            return fetch("/api/blogs", {
                method: "GET",
                credentials: 'same-origin', //Adding any cookies avilable here bcz we are not gonna login to blog, we want to access without loggining in and we also want make api call as original as possible which has a cookie so use any cookies.
                headers: { 
                    'Content-Type': 'application/json'
                }
            }).then(res=>res.json());

        });

        expect(result).toEqual({error:"You must log in!"});
    });
});




