
import express from 'express';
import playwright from 'playwright-core';
import cors from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios'
import { chromium }  from 'playwright-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
dotenv.config();

const app = express();
const PORT = 8080;
const URL = "https://www.amazon.com/";

const data = {
    detail:"",
    review:""
    
}

app.get("/",(request,response)=>{
    response.send("express is working!!")
})

app.use(cors())
app.get("/productDetail",(request,response)=>{
const review = []; 
const {id1,id2} = request.query;
    
    var page_number = 1;
    var next_btn = "cm_cr_getr_d_paging_btm_prev_";
    var has_next = true;

    
    
    (async()=>{
        const browser   = await playwright.chromium.launch({headless:true,timeout:0})
        	const context   = await browser.newContext();
        	const page      = await context.newPage({bypassCSP:true})
            const _url  = URL+id1+"/dp/"+id2;
		console.log(_url)
            let item_detail_title;
            let item_detail_store;
            let item_detail_price;
            let item_deital_image;
            let item_detail_rating;
            let item_detail_star_rating;
            let item_detail_product_detail_1;
            let item_detail_product_detail_2;
            let item_detail_product_detail_3;
            await page.goto(_url,{timeout:0});

            try {
                await page.waitForSelector("#productTitle")
                item_detail_title         = await page.$eval("#productTitle",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_title         = "";
            }

            try {
                await page.waitForSelector("#bylineInfo")
                item_detail_store         = await page.$eval("#bylineInfo",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_store         = "";
            }

            try {
                await page.waitForSelector(".a-price")
                item_detail_price         = await page.$eval(".a-price .a-offscreen",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_price         = "";
            }

            try {
                await page.waitForSelector("#landingImage")
                item_deital_image         = await page.$eval("#landingImage",(element)=>element.getAttribute('src'));
            } catch (error) {
                item_deital_image         = "";
            }

            try {
                await page.waitForSelector("#acrCustomerReviewText")
                item_detail_rating         = await page.$eval("#acrCustomerReviewText",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_rating         = "";
            }

            try {
                await page.waitForSelector("#acrCustomerReviewText")
                item_detail_rating         = await page.$eval("#acrCustomerReviewText",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_rating         = "";
            }

            try {
                await page.waitForSelector(".a-icon-alt")
                item_detail_star_rating         = await page.$eval(".a-icon-alt",(element)=>element.textContent.trim());
            } catch (error) {
                item_detail_star_rating         = "";
            }

            try {
                await page.waitForSelector("div[data-feature-name='productOverview']")
                item_detail_product_detail_1         = await page.$eval("div[data-feature-name='productOverview']",(element)=>element.outerHTML);
            } catch (error) {
                item_detail_product_detail_1        = "";
            }

            try {
                await page.waitForSelector("#productFactsDesktopExpander")
                item_detail_product_detail_2         = await page.$eval("#productFactsDesktopExpander",(element)=>element.outerHTML);
            } catch (error) {
                item_detail_product_detail_2         = "";
            } 

            try {
                await page.waitForSelector("#productFactsDesktopExpander")
                item_detail_product_detail_2         = await page.$eval("#productFactsDesktopExpander",(element)=>element.outerHTML);
            } catch (error) {
                item_detail_product_detail_2         = "";
            } 

            try {
                await page.waitForSelector("#featurebullets_feature_div")
                item_detail_product_detail_3         = await page.$eval("#featurebullets_feature_div",(element)=>element.outerHTML);
            } catch (error) {
                item_detail_product_detail_3         = "";
            } 
        
           const item_detail = 
                {
                    title:item_detail_title,
                    store:item_detail_store,
                    price:item_detail_price,
                    image:item_deital_image,
                    rating:item_detail_rating,
                    star_rating:item_detail_star_rating,
                    product_detail_1:item_detail_product_detail_1,
                    product_detail_2:item_detail_product_detail_2,
                    product_detail_3:item_detail_product_detail_3

                }
            data.detail = item_detail;
            await browser.close();
		console.log("details")
       
        while(has_next){

 		const browser   = await playwright.chromium.launch({headless:true,timeout:0})
        	const context   = await browser.newContext();
        	const page      = await context.newPage()
            const _url  = URL+id1+"/product-reviews/"+id2+"/ref="+next_btn+page_number+"?ie=UTF8&reviewerType=all_reviews&pageNumber="+page_number;
	console.log(_url)
            await page.goto(_url,{timeout:0});

            const details = await page.$$eval(".review",(element)=>{
            return element.map((item)=>{
                const name              = item.querySelector(".a-profile-name");
                const review            = item.querySelector(".review-text-content");
                const date_review       = item.querySelector("span[data-hook='review-date']") ?? "";
                const rating            = item.querySelector(".review-rating");
                const badge             = item.querySelector("span[data-hook='avp-badge']") ?? "";
                const username          = item.querySelector("a.a-profile") ? item.querySelector("a.a-profile").getAttribute("href") :  "" ;

                //convert to text
                const Text              = (value) => value.innerText;

                return{
                            name    :Text(name),
                            date    :Text(date_review),
                            rating  :Text(rating).replace(" out of 5 stars",""),
                            badge   :Text(badge),
                            review  :Text(review),
                            username:username.split("/")[3]
                    }
                })
            })
            

            details.map((item)=>{
                review.push(item);
            })
	await page.screenshot({ path: 'screenshot.png', fullPage: true });
            const next  = (await page.$("li.a-last")) || null;
            if(next == null){
                has_next = false;
            }
            else{
                const is_no_next = await page.$eval("li.a-last",(element)=>{
                    return element.classList.contains("a-disabled");
                })
                page_number++;
                if(is_no_next){
                    has_next = false;
                    break;
                }
            }
		console.log(page_number)
	        await browser.close();
        }
        
        data.review = review;
        response.json({data:data})
        
     })()
})




app.listen(PORT,()=>{
    console.log("connected to port "+PORT)
})
