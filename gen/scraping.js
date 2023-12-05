// Scraping script for https://docs.spring.io/spring-framework/docs/current/javadoc-api/constant-values.html

const summary = document.querySelector(".constants-summary")
var listElements = summary.querySelectorAll("li");
var results = [];


for (const ele of listElements) {
    var captionEle = ele.querySelector(".caption");
    var title = captionEle.innerText.split(".").at(-1);

    var valueNames = ele.querySelectorAll(".col-second>*>a")
    var values = ele.querySelectorAll(".col-last>code")

    if(valueNames.length != values.length){
        console.error("Value array lenght not same", valueNames, values)
        console.log("Skipping " + title)
        continue
    }

    let result =  {
        enumName : title,
        values : []
    }

    for (let index = 0; index < valueNames.length; index++) {
        let name = valueNames[index].innerText.split(".").at(-1);
        let value = values[index].innerText.replaceAll('"', "");
        result.values.push(
            {
                name ,
                value 
            }
        )
    
    }


    results.push(result)
    console.log(result)
}


JSON.stringify(results)