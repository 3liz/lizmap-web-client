Proj4js.Proj.gall = {
  init : function() {
    this.es = 0;
    this.yf = 1.70710678118654752440;
    this.xf = 0.70710678118654752440;
    this.ryf = 0.58578643762690495119;
    this.rxf = 1.41421356237309504880;
  },
  forward: function(p) {
    var x = this.xf * p.x*this.a;
    var y = this.yf * Math.tan(0.5*p.y)*this.a;
    p.x = x; p.y = y;
    return p;
  },
  inverse: function(p) {
    var lon = this.rxf * p.x / this.a;
    var lat = 2* Math.atan(this.ryf * p.y/ this.a);
    p.x = lon;
    p.y = lat;
    return p
  }
};
