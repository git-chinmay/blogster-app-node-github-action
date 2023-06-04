const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless: true,//fase will create GUI
            args: ['--no-sandbox'] //Will drmatically decrease the test to run in Travis virtual machine
        });
        const page = await browser.newPage();
        const cutsompage = new CustomPage(page)

        return new Proxy(cutsompage, {
            get: function(target, property){
                return target[property]  || browser[property] || page[property]
            }
        })
    }

    constructor(page){
        this.page = page
    }

    async login(){
        const user = await userFactory(); // Its returning a promise
        const {session, sig} = sessionFactory(user);
    
        //set the cookie
        await this.page.setCookie({ name: 'session', value: session});
        await this.page.setCookie({ name: 'session.sig', value: sig});
        // Refresh the page to load above 
        // await this.page.goto('localhost:3000/blogs'); // OK for running test in local (laptop/desktop)
        await this.page.goto('http://localhost:3000/blogs'); // For Travis we need http
    
        //wait for the page to oad properly
        await this.page.waitFor('a[href="/auth/logout"]');
    
        // Doing unit testing
        const text = await this.page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    }

    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML);

    }


}

module.exports = CustomPage;

