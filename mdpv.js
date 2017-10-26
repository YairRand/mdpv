// Multi-Dimensional Pukelsheim Viewer

function getDimensions( graph ) {
  var dimensions = [],
    current = graph;

  for ( ; current.constructor === Array; ) {
    dimensions.push( current.map( _ => 0 ) );
    current = current[ 0 ];
  }

  return dimensions;
}

function getCoords( graph, coords ) {
  //console.log( 'gC', arguments );
  var c = coords.shift();
  if ( c === '*' ) {
    return graph.map( row => getCoords( row, coords.slice( 0 ) ) );
  } else if ( c !== undefined ) {
    if ( !( c in graph ) ) {
      throw Error( 'gC: not found. ' + c, graph );
    }
    return getCoords( graph[ c ], coords );
  } else {
    return graph;
  }
}

function duplicateGraph( graph, fill ) {
  if ( graph[ 0 ].constructor === Array ) {
    return graph.map( sub => duplicateGraph( sub ) );
  } else {
    var dup = graph.slice( 0 );
    if ( fill !== undefined ) {
      dup.fill( fill );
    }
    return dup;
  }
}

function graphSum( graph ) {
  if ( graph.constructor === Array ) {
    return graph.reduce( ( x, y ) => x + graphSum( y ), 0 );
  } else {
    return graph;
  }
}

function arraySum( arr ) {
  return arr.reduce( ( x, y ) => x + y );
}

/**
 * @return {Array} results
 */
function dHondt( arr, num ) {
  if ( num === undefined ) {
    throw new Error( 'dHondt: No number given.' );
  }

  var result = arr.map( _ => 0 ), // Array.from( arr, _ => 0 );
    nextAvg = i => arr[ i ] / ( 1 + result[ i ] );
  for ( ; num--; ) {
    result[ arr.reduce( ( best, _, i ) => {
      return nextAvg( i ) > nextAvg( best ) ? i : best;
    }, 0 ) ]++;
  }
  return result;
}

function linearGroup( arr, num ) {
  // TODO: Something to make this work nicely with Pukelsheim stuff.
  // Need a clean way of "stretching" regions of the list.
  var chunkSize = arr.length / num;

  // TODO: Sometimes average two values? Or maybe not. Or maybe a config option.
  return Array.from( { length: num }, ( _, i ) => arr[ Math.floor( ( i + 0.5 ) * chunkSize ) ] );
}

function simplePukelsheim( graph, number ) {
  // Two points only.
  // I'll make another fn for n-dimensional.
  var dimensions = getDimensions( graph );

  var rows = Array.from( graph, _ => 1 ),
    cols = Array.from( graph[ 0 ], _ => 1 ),
    rowM = rows.map( _ => 1 ),
    colM = cols.map( _ => 1 );
  var result = graph.map( x => x.map( _ => 0 ) );

  function calcRowTotal( i ) {

  }

}

// AFAICT, Pukelsheim/BiproportionalAppointment appears to be the same system
// as "raking" used in statistics/surveys.
function mPukelsheim( graph, number ) {
  var dimensions = getDimensions( graph ),
    sum = graphSum( graph ),
    // Generate a list of row sizes, size being sum.
    rows = dimensions.map( ( d, i ) => {
      // d is a list of numbers, each corresponding to a "row".
      return d.map( ( x, ii ) => {
        //return graphSum( getCoords( graph, dimensions.map( ( _, ii ) => ii === i ? i : '*' ) ) );


        var x = getCoords( graph, dimensions.map( ( _, iii ) => iii === i ? ii : '*' ) );
        console.log( 'x', x );
        return graphSum( x );
      } );
    } ),
    rowResults = rows.map( row => dHondt( row, number ) ),
    modifiers = rows.map( row => row.map( _ => 1 ) );

  // Run through with modifiers starting at 1, adjust mods until it works.
  function calcResults() {
    var results,
      modified = false;

    var duplicate = duplicateGraph( graph );
    // Results needs to be as deep as graph itself... Hm.
    // Maybe work through things dimension by dimension?

    // Um, do I need a separate array for "depths" actual rows, not full tables in 3d? Agh.
    // This is going to get more complicated. Each subtable has a sum in
    // rowResults, but each row and column in that table also needs a sum.

    // Starting to worry about the performance on this.

    // Okay, do each additional dimension at a time. Start with ... two?

    // Modifiers will remain at its size. No sub-point mods.
    results = rowResults[ 0 ].map( ( rowResult, i ) => {
      //getCoords( graph, [ i, '*' ] );
      var row = graph[ i ].map( ( cell, i ) => cell * modifiers[ 1 ][ i ] ),
        seatCount = dHondt( row, rowResult );
        // total = arraySum( seatCount );
      console.log( 'eee', graph, row, i, seatCount, rowResult );
      return seatCount;
    } );

    rowResults[ 1 ].forEach( ( rowResult, i ) => {
      if ( arraySum( getCoords( results, [ '*', i ] ) ) < rowResult ) {
        modifiers[ 1 ][ i ]++;
        modified = true;
      }
    } );

    if ( modifiers[ 1 ][ 0 ] > 20 ) {
      return 'beh';
    }

    if ( modified === true ) {
      return calcResults();
    } else {
      console.log( 'b', { modifiers, rowResults, graph } )
      return results;
    }

  }

  console.log( 'rows', rows, 'dimensions', dimensions, rowResults );

  return calcResults();
}

// TODO: Some kind of PR-Schulze/Schulze-STV calculator that works with the above.

// getDimensions( [ [ [ 1, 10 ], [ 2, 20 ] ], [ [3, 30], [ 4, 40] ], [ [5,50], [6,60] ] ], [ 2, 1, 1 ] )

/*
graph.forEach( ( sub, i ) => {

} );
*/

function run() {
//return mPukelsheim( [ [ [ 1, 10 ], [ 2, 20 ] ], [ [3, 30], [ 4, 40] ], [ [5,50], [6,60] ] ], 20 );
  return mPukelsheim( [ [ 74, 26 ], [ 76, 24 ] ], 4 );
}

//var x = shrinkGraph( [ [ 74, 26 ], [ 76, 24 ] ], 4 );

console.log( run() );
