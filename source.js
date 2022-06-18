
let width = 800, height = 800;

let svg = d3.select("#graph").append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Background
 let rectBackGround = svg.append("rect")
  .attr("class", "rect-background")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "lightgrey");


// Load external data
Promise.all([d3.json("https://chi-loong.github.io/CSC3007/assignments/links-sample.json"), d3.json( "https://chi-loong.github.io/CSC3007/assignments/cases-sample.json")]).then(data => {

// Data preprocessing
data[0].forEach(e => {
    e.source = e.infector;
    e.target = e.infectee;
});

colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]

//Define colors 
let genderScale =  {"male": colors[0], "female": colors[1]} ;
let ageScale = d3.scaleQuantize([0, 90], d3.schemeRdYlGn[9]);
let vaccinatedScale = d3.scaleOrdinal(["no", "partial (1 dose)", "yes (2 doses)"], [colors[6], colors[8], colors[9]]);

  //Create tooltip
const tooltip = d3.select("body")
.append("div")
.attr("class","d3-tooltip")
.style("position", "absolute")
.style("visibility", "hidden")
.style("z-index", "10")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "1px")
.style("border-radius", "5px")
.style("padding", "10px");

let graph = svg.append("g").attr("id", "graph");

// Link marker
svg.append("svg:defs")
   .append("svg:marker")
    .attr("id", 'arrow')
    .attr('markerUnits', 'userSpaceOnUse')
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "red");

// Link path 
let linkpath = graph.append("g").attr("id", "links")
    .selectAll("path")
    .data(data[0])
    .enter().append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr('marker-end',  function(d) { return "url(#arrow)"})//attach the arrow from defs
    .style( "stroke-width", 2 );

// Define nodes
let nodes = graph.append("g")
  .attr("id", "nodes")
  .selectAll("circle")
  .data(data[1])
  .enter()
  .append("g");
 
 let circles= nodes.append("circle")
  .attr("r", 10)
  .attr("fill",function(d,i){
      return genderScale[d.gender];
  })
  // mouse hover
  .on("mouseover", (event, d) => {

    // add border to selected target
    d3.select(event.currentTarget)
    .attr("stroke",  colors[7])
    .attr("stroke-width", 2);

    // set tooltip to visible
    tooltip.html("ID: " + d.id + "</br>" +
                 "Age: " + d.age + "</br>" +
                 "Gender: " + d.gender + "</br>" +
                 "Nationality: " + d.nationality + "</br>" +
                 "Occupation: " + d.occupation + "</br>" 
    )
    .style("visibility", "visible")
    .style("top", (event.pageY)+"px")
    .style("left",(event.pageX)+"px");
  })
  .on("mouseout", (event, d) => {

    //remove border from selected target
    d3.select(event.currentTarget)
    .attr("stroke", "none");

    // set tooltip to invisible
    tooltip.html("").style("visibility", "hidden");

  });

// Add image to nodes
let image = nodes.append("image")
  .attr("xlink:href", function(d) {
      if (d.gender == "male") return "images/male.png"; else return "images/female.png";
  })
  .attr("width", 15)
  .attr("height", 15)
  .attr("pointer-events", "none");

//Force Simulation
let simulation = d3.forceSimulation()
.nodes(data[1])
.force('center', d3.forceCenter(width / 2, height / 2)) // Prevent the circle from moving from (0,0)
.force("x", d3.forceX().strength(0.1).x( width / 2 ))
.force("y", d3.forceY().strength(0.1).y( height /2 ))
.force("link", d3.forceLink(data[0])
  .id(d => d.id)
  .distance(1)
  .strength(0.1)
)
.force("charge", d3.forceManyBody().strength(-30))
.force("collide", d3.forceCollide().strength(0.1).radius(50))
.on("tick", tick);

function tick() {
  // linkpath.attr("d", function(d) {
  //   var dx = d.target.x - d.source.x,
  //       dy = d.target.y - d.source.y,
  //       dr = Math.sqrt(dx * dx + dy * dy)/4,
  //       mx = d.source.x + dx,
  //       my = d.source.y + dy;
  //   return [
  //     "M",d.source.x,d.source.y,
  //     "A",dr,dr,0,0,1,mx,my,
  //     "A",dr,dr,0,0,1,d.target.x,d.target.y
  //   ].join(" ");
  // });

  linkpath.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + 
        d.source.x + "," + 
        d.source.y + "A" + 
        dr + "," + dr + " 0 0,1 " + 
        d.target.x + "," + 
        d.target.y;
});
  

  circles.attr("cx", d => d.x )
  .attr("cy", d => d.y);

  image
  .attr("x", d => d.x - 7.5)
  .attr("y", d => d.y - 7.5);
}


// For updating the graph
d3.select("#genderSelect").on("click", (event,d)=> {
  create_legend("gender");
  updateSelection("gender");
});

d3.select("#ageSelect").on("click", (event,d)=> {
  create_legend("age");
  updateSelection("age");
});

d3.select("#vaccinatedSelect").on("click", (event,d)=> {
  create_legend("vaccinated");
  updateSelection("vaccinated");
});

function updateSelection(category) {
  circles
    .attr("fill", d => { 

         if (category == "gender") {
            return genderScale[d.gender];
        } else if (category == "age") {
            return ageScale(d.age);
        } else if (category == "vaccinated") {
            return vaccinatedScale(d.gender);   
        }
    });
}

//--------Legends-------------------//
const legend_start_x = 30;
const legend_start_y = 20;
const legend_y_offset = 30;
const legend_text_offset = 20;
const legend_limit = 9;

let start_x = legend_start_x;
let start_y = legend_start_y;

let group_for_legend = svg.append("g")
                  .attr("id", "legend");

for (let i = 0; i < legend_limit; i++) {
  let current_legend = group_for_legend.append("g")
  .attr("id", "legend "  + i);

  current_legend.append("circle").attr("class", "legend_circle_" + i ).attr("cx", start_x).attr("cy",start_y).attr("r", 6).style("visibility", "hidden");
  current_legend.append("text").attr("class", "legend_text_" + i ).attr("x", start_x + legend_text_offset).attr("y", start_y).style("font-size", "15px").attr("alignment-baseline","middle").style("visibility", "hidden");
  start_y += legend_y_offset;
}

function clear_legend(){
  for (let i = 0; i < legend_limit; i++) {
    d3.select(".legend_circle_" + i).style("visibility", "hidden");
    d3.select(".legend_text_" + i).style("visibility", "hidden");
  }
}

function create_legend(category){

  let index = 0;

    if (category == "gender") {

      clear_legend();
      for (const [key, value] of Object.entries(genderScale)) {
        d3.select(".legend_circle_" + index).style("fill",  value).style("visibility", "visible");
        d3.select(".legend_text_" + index).text(key).style("visibility", "visible");
        index += 1;
      }
 
  } else if (category == "age") {

    clear_legend();

    let start_age = 0;
    const age_offset = 9;

    for (let i = 0; i < legend_limit; i++) {
      d3.select(".legend_circle_" + i).style("fill",  ageScale(start_age)).style("visibility", "visible");
      d3.select(".legend_text_" + i).text(start_age + " to " +  (start_age + age_offset) + " years old").style("visibility", "visible");
      
      start_age = (start_age + 1 + age_offset);
    }

  } else if (category == "vaccinated") {

      clear_legend();

      d3.select(".legend_circle_" + 0).style("fill",  colors[6]).style("visibility", "visible");
      d3.select(".legend_text_" + 0).text("no").style("visibility", "visible");

      d3.select(".legend_circle_" + 1).style("fill",  colors[8]).style("visibility", "visible");
      d3.select(".legend_text_" + 1).text("partial (1 dose)").style("visibility", "visible");

      d3.select(".legend_circle_" + 2).style("fill",  colors[9]).style("visibility", "visible");
      d3.select(".legend_text_" + 2).text("yes (2 doses)").style("visibility", "visible"); 
  }

}

//Create default legend  
create_legend("gender");

// console.log(data[0]); // links
// console.log(data[1]); // cases

});