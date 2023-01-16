var data = d3.csv("data/workd-new-cases-covid-data.csv", d3.autoType)

const graf = d3.select("#graf")
const tooltip = d3.select("#tooltip")
const country = d3.select("#country")
const new_cases_per_million = d3.select("#new_cases_per_mil")
const total_deaths = d3.select("#total_deaths")
const btnAnimacion = d3.select("#btnAnimacion")

const margins = { left: 75, top: 40, right: 10, bottom: 50 }
const anchoTotal = + graf.style("width").slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16
const ancho = anchoTotal - margins.left - margins.right
const alto = altoTotal - margins.top - margins.bottom

const svg = graf
  .append("svg")
  .attr("width", anchoTotal)
  .attr("height", altoTotal)
  .attr("class", "fig")

const g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)

const clip = g
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", ancho)
  .attr("height", alto)

const year = g
  .append("text")
  .attr("x", ancho / 2)
  .attr("y", alto / 2)
  .attr("class", "year")

g.append("rect")
  .attr("x", "0")
  .attr("y", "0")
  .attr("width", ancho)
  .attr("height", alto)
  .attr("class", "grupo")

const x = d3.scaleLog().range([0, ancho])
const y = d3.scaleLinear().range([alto, 0])
const A = d3.scaleLinear().range([20, 70600])
const continente = d3.scaleOrdinal().range(d3.schemeSet2)

const xAxis = d3.axisBottom(x).tickSize(-alto)
const yAxis = d3.axisLeft(y).tickSize(-ancho)
const formatDate = d3.timeFormat("%Y-%m-%d");
var iy, miny, maxy
var animando = false
var intervalo
var pais


const load = async () => {
  //data = await d3.csv("data/gapminder.csv", d3.autoType)
  data = await d3.csv("data/workd-new-cases-covid-data.csv", d3.autoType)
  data = d3.filter(data, (d) => d.life_expectancy > 0 && d.new_cases > 0)
  x.domain(d3.extent(data, (d) => d.new_cases))
  y.domain(d3.extent(data, (d) => d.life_expectancy))
  A.domain(d3.extent(data, (d) => d.new_cases_per_million))
  continente.domain(Array.from(new Set(data.map((d) => d.continent))))

  miny = d3.min(data, (d) => formatDate(d.date))
  maxy = d3.max(data, (d) => formatDate(d.date))
  iy = miny

  g.append("g")
    .attr("transform", `translate(0, ${alto})`)
    .attr("class", "ejes")
    .call(xAxis)
  g.append("g").attr("class", "ejes").call(yAxis)

  g.append("text")
    .attr("x", ancho / 2)
    .attr("y", alto + 40)
    .attr("text-anchor", "middle")
    .attr("class", "labels")
    .text("Nuevos Casos COVID")

  g.append("g")
    .attr("transform", `translate(-40, ${alto / 2})`)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("class", "labels")
    .text("Expectativa de Vida")

  render(data)
}

const render = (data) => {
  
  const newData = d3.filter(data, (d) => formatDate(d.date) == iy)

  // [JOIN-]ENTER-UPDATE-EXIT
  const circle = g.selectAll("circle").data(newData, (d) => d.location)
  circle
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.new_cases))
    .attr("cy", (d) => y(d.life_expectancy))
    .attr("r", 0)
    .attr("fill", "#00FF0088")
    .attr("stroke", "#00000088")
    .attr("clip-path", "url(#clip)")
    .on("click", (_, d) => showTooltip(d))
    // .on("mouseout", () => hideTooltip())
    .merge(circle)
    .transition()
    .duration(500)
    .attr("cx", (d) => x(d.new_cases))
    .attr("cy", (d) => y(d.life_expectancy))
    .attr("r", (d) => A(d.new_cases_per_million))
    .attr("fill", (d) => continente(d.continent) + "88")

  circle
    .exit()
    .transition()
    .duration(500)
    .attr("r", 0)
    .attr("fill", "#ff000088")
    .remove()

  year.text(iy)

  d = newData.filter((d) => d.location == pais)[0]
  if (d != null){
    hideTooltip()
    tooltip.style("left", x(d.new_cases) + "px").style("top", y(d.life_expectancy) + "px")
    country.text(d.location)
    new_cases_per_million.text(d.new_cases_per_million.toLocaleString("en-US"))
    total_deaths.text(d.total_deaths.toLocaleString("en-US"))
  }
}

const delta = (d) => {
  var fecha = new Date(iy)
  var fecha2 = fecha.setDate(fecha.getDate() +  (d+1))
  iy = formatDate(fecha2)
  if (iy > maxy) {
    clearInterval(intervalo)
    animando = false
    btnAnimacion
      .classed("btn-success", true)
      .classed("btn-danger", false)
      .html("<i class='fas fa-play fa-2x'></i>")
    iy = maxy
  }
  if (iy < miny) iy = miny

  render(data)
}

const showTooltip = (d) => {
  pais = d.location
  console.log("DDD", d)
  tooltip
    .style("left", x(d.new_cases) + "px")
    .style("top", y(d.life_expectancy) + "px")
    .style("display", "block")
  country.text(d.location)
  new_cases_per_million.text(d.new_cases_per_million)
  total_deaths.text(d.total_deaths)
}

const hideTooltip = () => {
  tooltip.style("display", "none")
}

const toggleAnimacion = () => {
  animando = !animando
  if (animando) {
    btnAnimacion
      .classed("btn-success", false)
      .classed("btn-danger", true)
      .html("<i class='fas fa-pause fa-2x'></i>")

    intervalo = setInterval(() => delta(1), 500)
  } else {
    btnAnimacion
      .classed("btn-success", true)
      .classed("btn-danger", false)
      .html("<i class='fas fa-play fa-2x'></i>")

    clearInterval(intervalo)
  }
}

load()
