/*Funcion que dibuja el grafico dot plot y lineas:
    Recibe la zona donde debe dibujarse, el pais que se ha seleccionado y el año
    que se ha seleccionado para dibujar solo los datos referidos a esta seleccion*/
function dibujar(zona,pais_actual,actual_year){

          //PREPARAMOS EL LUGAR PARA DIBUJAR EL GRÁFICO

          var margin = {top: 70, right: 60, bottom: 30, left: 60},
          w = 900 - margin.left - margin.right,
          h = 600 - margin.top - margin.bottom;

          //creamos las escalas del eje x y dej eje y
          var x = d3.scaleBand().rangeRound([0,w]).padding(.1);
          var y = d3.scaleLinear().range([h, 0]);

          //creamos los ejes con sus respectivas divisiones
          var xAxis = d3.axisBottom().scale(x).ticks(4,"d").tickSize(8,0,0);
          var yAxis = d3.axisLeft().scale(y).ticks(9);

          //creamos la rejilla en el eje y para ayudar a diferenciar la posicion de los puntos
          var yGrid = d3.axisLeft().scale(y).ticks(4)
          .tickSize(-w, 0, 0).tickFormat("");


          //creamos el cuerpo de la visualizacion
          var svg = d3.select(zona).append("svg")
          .attr("width", w + margin.left + margin.right)
          .attr("height", h + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

          //Lectura de datos y trabajo con ellos para dibujar los puntos
          d3.csv("datos1.csv", function(error, data) {
                  var edades = new Array;
                  var puntosH = new Array;
                  var puntosM = new Array;

                  //Lectura de los datos
                  data.forEach(function(d) {

                      //Leemos las variables interesantes
                      d.val=+d.val;
                      d.year=d.year;
                      d.sex=d.sex;
                      d.age=d.age;
                      d.location= d.location;

                      //Cogemos los diferentes valores en la variable edad
                      if (edades === null) { //comprobar si esta vacio
                        edades.push(d.age); //añadir elemento
                      }
                      else {
                          if (edades.indexOf(d.age)== -1) {//comprobar si NO esta en el array
                                edades.push(d.age);
                            }
                        }

                      //Guardamos las coordenadas de los puntos para ambos sexos
                      if (d.location==pais_actual && d.year==actual_year && d.sex=="Male") {
                        puntosH.push({'x':d.age,'y':d.val})
                      }
                      if (d.location==pais_actual && d.year==actual_year && d.sex=="Female") {
                        puntosM.push({'x':d.age,'y':d.val})
                      }
                  });


                  //Creamos la variable linea, que contendrá los puntos necesarios pra dibujar la linea
                  var linea = d3.line()
                    .x(function(d) {
                        return x(d['x'])+85;
                    })
                    .y(function(d) {
                        return y(d['y']);
                    });


                  //El dominio de x son los valores distintos en edad
                  x.domain(edades);
                  //El dominio de y se fija entre 0 y 120
                  y.domain([0, 120]);

                  //dibujamos los ejes y la rejilla
                  svg.append("g").attr("class", "x axis").
                  attr("transform", "translate(0, " + h + ")").call(xAxis);
                  svg.append("g").attr("class", "y axis").call(yAxis);
                  svg.append("g").attr("class", "grid").call(yGrid).attr("stroke","light-grey");

                  //creamos las etiquetas de los ejes
                  var labels = svg.append("g").attr("class", "labels");
                  labels.append("text").attr("y", 10).attr("x", 186)
                  .attr("dy", ".71em").style("font-size", "15px")
                  .style("text-anchor", "end")
                  .text("Suicidios/100.000 hab");


                  //Añadimos el titulo del grafico
                  var title = svg.append("g")
                  .attr("class", "title");
                  title.append("text")
                  .attr("x", (w/2))
                  .attr("y", -30 )
                  .attr("text-anchor", "middle")
                  .style("font-size", "30px").style("font-weight","bold")
                  .text("Suicidios por edad y género.");

                  //Añadimos la ruta que siguen las lineas para hombres
                  svg.append("path")
                  .attr("class", "lineaH")
                  .attr("d",linea(puntosH))
                  .attr("stroke","black")
                  .attr("stroke-width",2.5)
                  .attr("fill","none").transition().duration(3000);

                  //Añadimos la ruta que siguen las lineas para mujeres
                  svg.append("path")
                  .attr("class", "lineaM")
                  .attr("d",linea(puntosM))
                  .attr("stroke","black")
                  .attr("stroke-width",2.5)
                  .attr("fill","none");

                  //Añadimos los puntos al grafico
                  svg.selectAll("circle")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("stroke","black")
                  .attr("stroke-width",1.5)
                  /*Escogemos solo las caoordenadas de los puntos interesantes, los
                  correspondientes al pais y año seleccionados*/
                  .attr("cx", function(d){
                    if (d.location==pais_actual && d.year==actual_year) {
                      return x(d.age)+85;
                    }
                  })
                  /*Si el punto no es intresante, el radio sera cero*/
                  .attr("r",function(d){
                    if ( d.year==actual_year && d.location==pais_actual) {
                      return 12;
                    }else {
                      return 0;
                    }
                  })
                  .attr("cy", function(d){
                    if (d.year==actual_year && d.location==pais_actual) {
                      return y(d.val);
                    }
                  })
                  /*Distinto color para puntos correspondientes a hombres y a mujeres*/
                  .attr("fill",function(d){
                    if(d.sex=="Male"){
                      return "rgb(30, 110, 190)";
                    }else {
                      return "rgb(240, 0, 120)";
                    }
                  })
                  /*Interaccion con los puntos*/
                  .on("mouseover", handleMouseOver)
	    	          .on("mouseout", handleMouseOut);

                  //funcion que muestra el valor de un punto al pasar el raton por encima de este
                  function handleMouseOver(d, i) {

                  		//Aumentar el tamaño del punto
                      d3.select(this).attr("r",16);

                      svg.append('text')
                       .attr('class','tooltiptxt')
                       //Colocación del texto al lado del punto
                       .attr('y',d3.select(this).attr('cy')-35)
                       .attr("x", d3.select(this).attr('cx'))
                       .attr('dx','3px')
                       .attr('dy','14px')
                       .style("font-weight","bold")
                       .style("font-size","13px")
                       .text(Math.round(d.val))

                  	}


      	          //Función que elimina el texto quitar el ratón del punto
                	function handleMouseOut(d, i) {
                		//Se establece el punto a radio normal
                      d3.select(this).attr("r",12);

                      //Se oculta la etiqueta
                      d3.selectAll('.tooltiptxt').remove();

                  }

          });

}
