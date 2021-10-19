// Create the equation system to be solved
// src and dst - Arrays with square corners coordinates
//
// from: Multiple View Geometry in Computer Vision 2ed
//       Hartley R. and Zisserman A.
//
// x' = xH
// where H is the homography: a 3 by 3 matrix
// that transformed to inhomogeneous coordinates for each point
// gives the following equations for each point:
//
// x' * (h31*x + h32*y + h33) = h11*x + h12*y + h13
// y' * (h31*x + h32*y + h33) = h21*x + h22*y + h23
//
// as the homography is scale independent we can let h33 be 1 (indeed any of the terms)
// so for 4 points we have 8 equations for 8 terms to solve: h11 - h32
// after ordering the terms it gives the following matrix
// that can be solved with gaussian elimination: http://en.wikipedia.org/wiki/Gaussian_elimination
//
// gaussian elimination gives the results of the equation system
// in the last column of the original matrix
// opengl needs the transposed 4x4 matrix

function gaussianElimination(A){
  const n = 9
  let i = 0;
  let j = 0;
  let m = n-1;

  while (i < m && j < n) {
    // Find pivot in column j, starting in row i
    let maxi = i
    for(let k = i + 1; k < m; k++) {
      if (Math.abs(A[k * n + j]) > Math.abs(A[maxi * n + j])) {
        maxi = k
      }
    }

    if (A[maxi*n+j] !== 0) {
      //swap rows i and maxi, but do not change the value of i
      if (i !== maxi) {
        for (let k = 0; k < n; k++) {
          let tmp = A[i * n + k]
          A[i * n + k] = A[maxi * n + k]
          A[maxi * n + k] = tmp
        }
      }

      //Now A[i,j] will contain the old value of A[maxi,j]
      //divide each entry in row i by A[i,j]
      let A_ij = A[i * n + j]
      for (let k = 0; k < n; k++) {
         A[i * n + k] /= A_ij;
      }

      //Now A[i,j] will have the value 1
      for (let u = i + 1; u < m; u++) {
        //subtract A[u,j] * row i from row u
        let A_uj = A[u * n + j];
        for(let k = 0; k < n; k++) {
          A[u * n + k] -= A_uj * A[i * n + k]
        }
        //Now A[u,j] will be 0, since A[u,j] - A[i,j] * A[u,j] = A[u,j] - 1 * A[u,j] = 0
      }

      i++
    }

    j++
  }

  //back substitution
  for (let i = m - 2; i >= 0; i--) {
    for (let j = i + 1; j < n - 1; j++) {
      A[i * n + m] -= A[i * n + j] * A[j * n + m]
      //A[i*n+j]=0;
    }
  }
}

export function FindHomography(src, dst) {
  const P = [
    -src[0*2+0], -src[0*2+1], -1,      0,           0,       0, src[0*2+0] * dst[0*2+0], src[0*2+1] * dst[0*2+0], -dst[0*2+0], // h11
         0     ,      0     ,  0, -src[0*2+0], -src[0*2+1], -1, src[0*2+0] * dst[0*2+1], src[0*2+1] * dst[0*2+1], -dst[0*2+1], // h12

    -src[1*2+0], -src[1*2+1], -1,      0,           0,       0, src[1*2+0] * dst[1*2+0], src[1*2+1] * dst[1*2+0], -dst[1*2+0], // h13
         0,          0,        0, -src[1*2+0], -src[1*2+1], -1, src[1*2+0] * dst[1*2+1], src[1*2+1] * dst[1*2+1], -dst[1*2+1], // h21

    -src[2*2+0], -src[2*2+1], -1,      0,           0,       0, src[2*2+0] * dst[2*2+0], src[2*2+1] * dst[2*2+0], -dst[2*2+0], // h22
         0,           0,       0, -src[2*2+0], -src[2*2+1], -1, src[2*2+0] * dst[2*2+1], src[2*2+1] * dst[2*2+1], -dst[2*2+1], // h23

    -src[3*2+0], -src[3*2+1], -1,      0,           0,       0, src[3*2+0] * dst[3*2+0], src[3*2+1] * dst[3*2+0], -dst[3*2+0], // h31
         0,           0,       0, -src[3*2+0], -src[3*2+1], -1, src[3*2+0] * dst[3*2+1], src[3*2+1] * dst[3*2+1], -dst[3*2+1], // h32
  ]

  gaussianElimination(P, 9)

  return new Float64Array([
    P[0*9+8], P[3*9+8], 0, P[6*9+8], // h11  h21 0 h31
    P[1*9+8], P[4*9+8], 0, P[7*9+8], // h12  h22 0 h32
        0   ,     0   , 1,     0   , //  0    0  0  0
    P[2*9+8], P[5*9+8], 0,     1   , // h13  h23 0 h33
  ])
}
