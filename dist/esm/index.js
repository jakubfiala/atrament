var t=null;try{var e="undefined"!=typeof module&&"function"==typeof module.require&&module.require("worker_threads")||"function"==typeof __non_webpack_require__&&__non_webpack_require__("worker_threads")||"function"==typeof require&&require("worker_threads");t=e.Worker}catch(t){}function g(e,g,s){var i=function(t,e){return Buffer.from(t,"base64").toString("utf8")}(e),o=i.indexOf("\n",10)+1,I=i.substring(o)+"";return function(e){return new t(I,Object.assign({},e,{eval:!0}))}}function s(t,e,g){var s=function(t,e){return atob(t)}(t),i=s.indexOf("\n",10)+1,o=s.substring(i)+"",I=new Blob([o],{type:"application/javascript"});return URL.createObjectURL(I)}var i="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0);var o,I=(o="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8gY29sb3VyIGluZGljZXMgcGVyIHBpeGVsCiAgY29uc3QgUiA9IDA7CiAgY29uc3QgRyA9IDE7CiAgY29uc3QgQiA9IDI7CiAgY29uc3QgQSA9IDM7CgogIGNvbnN0IFBJWEVMID0gNDsKICBjb25zdCBUUkFOU1BBUkVOVCA9IDA7CiAgY29uc3QgT1BBUVVFID0gMjU1OwoKICBjb25zdCBoZXhUb1JnYiA9IChoZXhDb2xvcikgPT4gewogICAgLy8gU2luY2UgaW5wdXQgdHlwZSBjb2xvciBwcm92aWRlcyBoZXggYW5kIEltYWdlRGF0YSBhY2NlcHRzIFJHQiBuZWVkIHRvIHRyYW5zZm9ybQogICAgY29uc3QgbSA9IGhleENvbG9yLm1hdGNoKC9eIz8oW1xkYS1mXXsyfSkoW1xkYS1mXXsyfSkoW1xkYS1mXXsyfSkkL2kpOwogICAgcmV0dXJuIFsKICAgICAgcGFyc2VJbnQobVsxXSwgMTYpLAogICAgICBwYXJzZUludChtWzJdLCAxNiksCiAgICAgIHBhcnNlSW50KG1bM10sIDE2KSwKICAgIF07CiAgfTsKCiAgLy8gUGl4ZWwgY29sb3IgZXF1YWxzIGNvbXAgY29sb3I/CiAgY29uc3QgY29sb3JNYXRjaGVyID0gKGRhdGEsIGNvbXBSLCBjb21wRywgY29tcEIsIGNvbXBBKSA9PiAocGl4ZWxQb3MpID0+ICgKICAgIGRhdGFbcGl4ZWxQb3MgKyBSXSA9PT0gY29tcFIKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBHXSA9PT0gY29tcEcKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBCXSA9PT0gY29tcEIKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBBXSA9PT0gY29tcEEKICApOwoKICBjb25zdCBjb2xvck1hdGNoZXJJZ25vcmVBbHBoYSA9IChkYXRhLCAuLi5hcmdzKSA9PiB7CiAgICBjb25zdCBtYXRjaCA9IGNvbG9yTWF0Y2hlcihkYXRhLCAuLi5hcmdzKTsKCiAgICByZXR1cm4gKHBpeGVsUG9zKSA9PiB7CiAgICAgIGNvbnN0IGFscGhhID0gZGF0YVtwaXhlbFBvcyArIEFdOwogICAgICBpZiAoYWxwaGEgIT09IFRSQU5TUEFSRU5UICYmIGFscGhhICE9PSBPUEFRVUUpIHsKICAgICAgICByZXR1cm4gdHJ1ZTsKICAgICAgfQoKICAgICAgcmV0dXJuIG1hdGNoKHBpeGVsUG9zKTsKICAgIH07CiAgfTsKCiAgLyogZXNsaW50LWRpc2FibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi8KICBjb25zdCBwaXhlbFBhaW50ZXIgPSAoZGF0YSwgZmlsbFIsIGZpbGxHLCBmaWxsQiwgZmlsbEEpID0+IChwaXhlbFBvcykgPT4gewogICAgZGF0YVtwaXhlbFBvcyArIFJdID0gZmlsbFI7CiAgICBkYXRhW3BpeGVsUG9zICsgR10gPSBmaWxsRzsKICAgIGRhdGFbcGl4ZWxQb3MgKyBCXSA9IGZpbGxCOwogICAgZGF0YVtwaXhlbFBvcyArIEFdID0gZmlsbEE7CiAgfTsKCiAgY29uc3QgcGl4ZWxQYWludGVyTWl4QWxwaGEgPSAoZGF0YSwgZmlsbFIsIGZpbGxHLCBmaWxsQiwgZmlsbEEpID0+IChwaXhlbFBvcykgPT4gewogICAgY29uc3Qgb2xkQWxwaGEgPSBkYXRhW3BpeGVsUG9zICsgQV07CiAgICAvLyBjYWxjdWxhdGUgcmF0aW8gb2Ygb2xkIHZzLiBuZXcgY29sb3VyIHRvIGJlIGFscGhhLW1peGVkCiAgICBjb25zdCBtaXhBbHBoYU9sZCA9IG9sZEFscGhhID09PSBPUEFRVUUKICAgICAgPyBUUkFOU1BBUkVOVAogICAgICA6IG9sZEFscGhhIC8gT1BBUVVFOwogICAgY29uc3QgbWl4QWxwaGFOZXcgPSAxIC0gbWl4QWxwaGFPbGQ7CgogICAgY29uc3QgcGFpbnQgPSBwaXhlbFBhaW50ZXIoCiAgICAgIGRhdGEsCiAgICAgIE1hdGguZmxvb3IobWl4QWxwaGFPbGQgKiBkYXRhW3BpeGVsUG9zICsgUl0gKyBtaXhBbHBoYU5ldyAqIGZpbGxSKSwKICAgICAgTWF0aC5mbG9vcihtaXhBbHBoYU9sZCAqIGRhdGFbcGl4ZWxQb3MgKyBHXSArIG1peEFscGhhTmV3ICogZmlsbEcpLAogICAgICBNYXRoLmZsb29yKG1peEFscGhhT2xkICogZGF0YVtwaXhlbFBvcyArIEJdICsgbWl4QWxwaGFOZXcgKiBmaWxsQiksCiAgICAgIGZpbGxBLAogICAgKTsKCiAgICByZXR1cm4gcGFpbnQocGl4ZWxQb3MpOwogIH07CiAgLyogZXNsaW50LWVuYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqLwoKICAvKioKICAgKiBTdGFjay0gYW5kIHNwYW4tYmFzZWQgZmxvb2QgZmlsbCBhbGdvcml0aG0KICAgKiBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmxvb2RfZmlsbCNTcGFuX2ZpbGxpbmcKICAgKgogICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIG9wdGlvbnMgb2JqZWN0CiAgICogQHJldHVybnMge1VJbnQ4Q2xhbXBlZEFycmF5fSB0aGUgbW9kaWZpZWQgcGl4ZWxzCiAgICovCiAgY29uc3QgZmxvb2RGaWxsID0gKHsKICAgIGltYWdlLAogICAgd2lkdGgsCiAgICBoZWlnaHQsCiAgICBjb2xvciwKICAgIGdsb2JhbEFscGhhLAogICAgc3RhcnRYLAogICAgc3RhcnRZLAogICAgc3RhcnRDb2xvciwKICB9KSA9PiB7CiAgICBjb25zdCByb3cgPSB3aWR0aCAqIFBJWEVMOwogICAgLy8gbWFrZSBzdXJlIHN0YXJ0IGNvb3JkaW5hdGVzIGFyZSBpbnRlZ2VycwogICAgY29uc3Qgc3RhcnRYQ29vcmQgPSBNYXRoLmZsb29yKHN0YXJ0WCk7CiAgICBjb25zdCBzdGFydFlDb29yZCA9IE1hdGguZmxvb3Ioc3RhcnRZKTsKICAgIC8vIGhleCBuZWVkcyB0byBiZSB0cmFzZm9ybWVkIHRvIHJnYiBzaW5jZSBJbWFnZURhdGEgdXNlcyBSR0IKICAgIGNvbnN0IGZpbGxDb2xvciA9IGhleFRvUmdiKGNvbG9yKTsKICAgIC8vIGVuc3VyZSBhbHBoYSBpcyBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBvZiAwLTI1NQogICAgY29uc3QgZmlsbEFscGhhID0gTWF0aC5mbG9vcihNYXRoLm1heCgwLCBNYXRoLm1pbihnbG9iYWxBbHBoYSAqIE9QQVFVRSwgT1BBUVVFKSkpOwogICAgLy8gd2UgbmVlZCBkaWZmZXJlbnQgYmVoYXZpb3VyIGluIGNhc2Ugd2UncmUgZmlsbGluZyBhIG5vbi1vcGFxdWUgYXJlYQogICAgY29uc3QgZmlsbGluZ05vbk9wYXF1ZSA9IHN0YXJ0Q29sb3JbQV0gIT09IE9QQVFVRTsKICAgIC8vIG91ciBwaXhlbCBwYWludGVyIHNob3VsZCBvbmx5IG1peCBhbHBoYSBpZiB3ZSdyZSBzdGFydGluZyBpbiBhIG5vbi1vcGFxdWUgYXJlYQogICAgY29uc3QgcGl4ZWxQYWludGVyT2ZDaG9pY2UgPSBmaWxsaW5nTm9uT3BhcXVlID8gcGl4ZWxQYWludGVyTWl4QWxwaGEgOiBwaXhlbFBhaW50ZXI7CiAgICBjb25zdCBwYWludFBpeGVsID0gcGl4ZWxQYWludGVyT2ZDaG9pY2UoaW1hZ2UsIC4uLmZpbGxDb2xvciwgZmlsbEFscGhhKTsKICAgIC8vIHdoZW4gbG9va2luZyBmb3IgdGhlIHNwYW4gc3RhcnQsIHdlIGlnbm9yZSB0aGUgYWxwaGEgdmFsdWUgaWYgZmlsbGluZyBhIG5vbi1vcGFxdWUgYXJlYQogICAgLy8gdGhpcyBlbnN1cmVzIHRoYXQgd2UnbGwgbWl4IHRoZSBmaWxsIGludG8gYW50aWFsaWFzZWQgZWRnZXMKICAgIGNvbnN0IGNvbG9yTWF0Y2hlclNwYW5TdGFydCA9IGZpbGxpbmdOb25PcGFxdWUgPyBjb2xvck1hdGNoZXJJZ25vcmVBbHBoYSA6IGNvbG9yTWF0Y2hlcjsKICAgIGNvbnN0IG1hdGNoU3BhblN0YXJ0Q29sb3IgPSBjb2xvck1hdGNoZXJTcGFuU3RhcnQoaW1hZ2UsIC4uLnN0YXJ0Q29sb3IpOwogICAgLy8gZm9yIGFsbCBvdGhlciBjYXNlcywgd2UgbG9vayBmb3IgdGhlIHN0YXJ0IGNvbG91ciBleGFjdGx5CiAgICBjb25zdCBtYXRjaFN0YXJ0Q29sb3IgPSBjb2xvck1hdGNoZXJJZ25vcmVBbHBoYShpbWFnZSwgLi4uc3RhcnRDb2xvcik7CgogICAgLy8gY2hlY2sgaWYgd2UncmUgdHJ5aW5nIHRvIGZpbGwgd2l0aCB0aGUgc2FtZSBjb2xvdXIsIGlmIHNvLCBzdG9wCiAgICBjb25zdCBtYXRjaEZpbGxDb2xvciA9IGNvbG9yTWF0Y2hlcihpbWFnZSwgLi4uWy4uLmZpbGxDb2xvciwgT1BBUVVFXSk7CiAgICBpZiAobWF0Y2hGaWxsQ29sb3IoKHN0YXJ0WUNvb3JkICogd2lkdGggKyBzdGFydFhDb29yZCkgKiBQSVhFTCkpIHsKICAgICAgcmV0dXJuIGltYWdlOwogICAgfQogICAgLy8gYmVnaW4gd2l0aCBvdXIgc3RhcnQgcGl4ZWwKICAgIGNvbnN0IHBpeGVsU3RhY2sgPSBbW3N0YXJ0WENvb3JkLCBzdGFydFlDb29yZF1dOwogICAgd2hpbGUgKHBpeGVsU3RhY2subGVuZ3RoKSB7CiAgICAgIGNvbnN0IFt4LCB5XSA9IHBpeGVsU3RhY2sucG9wKCk7CiAgICAgIC8vIGNvbHVtbiBwb3NpdGlvbiBpcyBpbiBjYXJ0ZXNpYW4gc3BhY2UgKHgseSkKICAgICAgbGV0IGNvbHVtblBvc2l0aW9uID0geTsKICAgICAgLy8gcGl4ZWwgcG9zaXRpb24gaXMgaW4gMUQgc3BhY2UgKHRoZSByYXcgaW1hZ2UgZGF0YSBVSW50OENsYW1wZWRBcnJheSkKICAgICAgbGV0IHBpeGVsUG9zID0gKGNvbHVtblBvc2l0aW9uICogd2lkdGggKyB4KSAqIFBJWEVMOwogICAgICAvLyBzdGFydCBtb3ZpbmcgZGlyZWN0bHkgdXAgZnJvbSBvdXIgc3RhcnQgcG9zaXRpb24KICAgICAgLy8gdW50aWwgd2UgZmluZCBhIGRpZmZlcmVudCBjb2xvdXIgdG8gdGhlIHN0YXJ0IGNvbG91cgogICAgICAvLyB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2Ygb3VyIHNwYW4KICAgICAgd2hpbGUgKGNvbHVtblBvc2l0aW9uLS0gPj0gMCAmJiBtYXRjaFNwYW5TdGFydENvbG9yKHBpeGVsUG9zKSkgewogICAgICAgIHBpeGVsUG9zIC09IHJvdzsKICAgICAgfQogICAgICAvLyBtb3ZlIG9uZSByb3cgZG93biAodG9wbW9zdCBwaXhlbCBvZiBmaWxsYWJsZSBhcmVhKQogICAgICBwaXhlbFBvcyArPSByb3c7CgogICAgICBsZXQgcmVhY2hMZWZ0ID0gZmFsc2U7CiAgICAgIGxldCByZWFjaFJpZ2h0ID0gZmFsc2U7CiAgICAgIC8vIGZvciBlYWNoIHJvdywgY2hlY2sgaWYgdGhlIGZpcnN0IHBpeGVsIHN0aWxsIGhhcyB0aGUgc3RhcnQgY29sb3VyCiAgICAgIC8vIGlmIGl0IGRvZXMsIHBhaW50IGl0IGFuZCBwdXNoIHN1cnJvdW5kaW5nIHBpeGVscyB0byB0aGUgc3RhY2sgb2YgcGl4ZWxzIHRvIGNoZWNrCiAgICAgIHdoaWxlICgrK2NvbHVtblBvc2l0aW9uIDwgaGVpZ2h0IC0gMSAmJiBtYXRjaFN0YXJ0Q29sb3IocGl4ZWxQb3MpKSB7CiAgICAgICAgcGFpbnRQaXhlbChwaXhlbFBvcyk7CiAgICAgICAgLy8gY2hlY2sgdGhlIHBpeGVsIHRvIHRoZSBsZWZ0CiAgICAgICAgaWYgKHggPiAwKSB7CiAgICAgICAgICBpZiAobWF0Y2hTdGFydENvbG9yKHBpeGVsUG9zIC0gUElYRUwpKSB7CiAgICAgICAgICAgIGlmICghcmVhY2hMZWZ0KSB7CiAgICAgICAgICAgICAgcGl4ZWxTdGFjay5wdXNoKFt4IC0gMSwgY29sdW1uUG9zaXRpb25dKTsKICAgICAgICAgICAgICByZWFjaExlZnQgPSB0cnVlOwogICAgICAgICAgICB9CiAgICAgICAgICB9IGVsc2UgaWYgKHJlYWNoTGVmdCkgewogICAgICAgICAgICByZWFjaExlZnQgPSBmYWxzZTsKICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgLy8gY2hlY2sgdGhlIHBpeGVsIHRvIHRoZSByaWdodAogICAgICAgIGlmICh4IDwgd2lkdGggLSAxKSB7CiAgICAgICAgICBpZiAobWF0Y2hTdGFydENvbG9yKHBpeGVsUG9zICsgUElYRUwpKSB7CiAgICAgICAgICAgIGlmICghcmVhY2hSaWdodCkgewogICAgICAgICAgICAgIHBpeGVsU3RhY2sucHVzaChbeCArIDEsIGNvbHVtblBvc2l0aW9uXSk7CiAgICAgICAgICAgICAgcmVhY2hSaWdodCA9IHRydWU7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0gZWxzZSBpZiAocmVhY2hSaWdodCkgewogICAgICAgICAgICByZWFjaFJpZ2h0ID0gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIC8vIG1vdmUgdG8gdGhlIG5leHQgcm93CiAgICAgICAgcGl4ZWxQb3MgKz0gcm93OwogICAgICB9CiAgICB9CgogICAgcmV0dXJuIGltYWdlOwogIH07CgogIGdsb2JhbFRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsICh7IGRhdGEgfSkgPT4gewogICAgY29uc3QgcmVzdWx0ID0gZmxvb2RGaWxsKGRhdGEpOwoKICAgIGdsb2JhbFRoaXMucG9zdE1lc3NhZ2UoeyB0eXBlOiAnZmlsbC1yZXN1bHQnLCByZXN1bHQgfSwgW3Jlc3VsdC5idWZmZXJdKTsKICB9KTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmtlci5qcy5tYXAKCg==",i?g(o):function(t,e,g){var i;return function(e){return i=i||s(t),new Worker(i,e)}}(o));class h{constructor(t,e){this.x=t,this.y=e}set(t,e){this.x=t,this.y=e}}class C extends h{constructor(){super(0,0),this.down=!1,this.previous=new h(0,0)}}class n{constructor(){this.eventListeners=new Map}addEventListener(t,e){const g=this.eventListeners.get(t)||new Set;g.add(e),this.eventListeners.set(t,g)}removeEventListener(t,e){const g=this.eventListeners.get(t);g&&g.delete(e)}dispatchEvent(t,e){const g=this.eventListeners.get(t);g&&[...g].forEach((t=>t(e)))}}const c=(t,e,g,s)=>{const i=(g-t)**2,o=(s-e)**2;return Math.sqrt(i+o)},r=t=>e=>{e.isPrimary&&(e.cancelable&&e.preventDefault(),t(e))},a=Symbol("atrament mode - draw"),d=Symbol("atrament mode - erase"),l=Symbol("atrament mode - fill"),G=Symbol("atrament mode - disabled"),A=[a,d],b=["weight","smoothing","adaptiveStroke","mode"];class B extends n{adaptiveStroke=!0;canvas;recordStrokes=!1;smoothing=.85;thickness=2;#t;#e=!1;#g=!1;#s=[];#i=new I;#o=a;#I=new C;#h=.5;#C;#n=[];#c=2;#r=2;constructor(t,e={}){if("undefined"==typeof window)throw new Error("atrament: looks like we're not running in a browser");super(),this.canvas=B.#a(t,e),this.#t=B.#d(this.canvas,e),this.#l(),this.#C=(({canvas:t,move:e,down:g,up:s})=>{const i=r(e),o=r(g),I=r(s);return t.addEventListener("pointermove",i),t.addEventListener("pointerdown",o),document.addEventListener("pointerup",I),document.addEventListener("pointerout",I),()=>{t.removeEventListener("pointermove",i),t.removeEventListener("pointerdown",o),document.removeEventListener("pointerup",I),document.removeEventListener("pointerout",I)}})({canvas:this.canvas,move:this.#G.bind(this),down:this.#A.bind(this),up:this.#b.bind(this)}),b.forEach((t=>{void 0!==e[t]&&(this[t]=e[t])}))}beginStroke(t,e){this.#t.moveTo(t,e),this.#c=this.#r,this.recordStrokes&&(this.strokeTimestamp=performance.now()),this.dispatchEvent("strokestart",{x:t,y:e})}endStroke(t,e){this.dispatchEvent("strokeend",{x:t,y:e}),this.recordStrokes&&this.dispatchEvent("strokerecorded",{stroke:this.currentStroke}),this.#n=[],delete this.strokeTimestamp}draw(t,e,g,s){const i=this.getSmoothingFactor(c(t,e,g,s)),o=t-(t-g)*i,I=e-(e-s)*i;if(0===g&&0===s)return{x:o,y:I};const C=c(o,I,g,s);if(this.adaptiveStroke){const t=(C-2)/(98*(1-this.#h))*(this.#B-this.#r)+this.#r;this.#c>t?this.#c-=.25:this.#c<t&&(this.#c+=.25)}else this.#c=this.#r;return this.#t.lineWidth=this.#c,this.#t.beginPath(),this.#t.moveTo(g,s),this.#t.quadraticCurveTo(g,s,o,I),this.#t.closePath(),this.#t.stroke(),this.recordStrokes&&(this.#n.push({point:new h(t,e),time:performance.now()-this.strokeTimestamp}),this.dispatchEvent("segmentdrawn",{stroke:this.currentStroke})),this.#e||this.#o!==a||(this.#e=!0,this.dispatchEvent("dirty")),{x:o,y:I}}clear(){this.#e=!1,this.dispatchEvent("clean");const t=this.mode===d;t&&(this.mode=a),this.#t.save(),this.#t.setTransform(1,0,0,1,0,0),this.#t.clearRect(0,0,this.canvas.width,this.canvas.height),this.#t.restore(),t&&(this.mode=d)}destroy(){this.clear(),this.#C?.()}get color(){return this.#t.strokeStyle}set color(t){if("string"!=typeof t)throw new Error("atrament: wrong argument type setting color");this.#t.strokeStyle=t}get weight(){return this.#r}set weight(t){if("number"!=typeof t)throw new Error("atrament: wrong argument type setting weight");this.#c=t,this.#r=t}get#B(){return this.#r+30}getSmoothingFactor(t){return Math.min(.87,this.smoothing+(t-60)/3e3)}get mode(){return this.#o}set mode(t){switch(t){case d:this.#o=d,this.#t.globalCompositeOperation="destination-out";break;case l:this.#o=l,this.#t.globalCompositeOperation="source-over";break;case G:this.#o=G;break;case a:this.#o=a,this.#t.globalCompositeOperation="source-over";break;default:throw new Error("atrament: mode is not one of the allowed modes.")}}get currentStroke(){return{segments:this.#n.slice(),mode:this.mode,weight:this.weight,smoothing:this.smoothing,color:this.color,adaptiveStroke:this.adaptiveStroke}}get dirty(){return this.#e}static#a(t,e){let g;if(t instanceof window.Node&&"CANVAS"===t.tagName)g=t;else{if("string"!=typeof t)throw new Error(`atrament: can't look for canvas based on '${t}'`);g=document.querySelector(t)}if(!g)throw new Error("atrament: canvas not found");return g.width=(e.width||g.width)*window.devicePixelRatio,g.height=(e.height||g.height)*window.devicePixelRatio,g.style.touchAction="none",g}static#d(t,e){const g=t.getContext("2d");return g.scale(window.devicePixelRatio,window.devicePixelRatio),g.globalCompositeOperation="source-over",g.globalAlpha=1,g.strokeStyle=e.color||"rgba(0,0,0,1)",g.lineCap="round",g.lineJoin="round",g}#G(t){(t.getCoalescedEvents?.()||[t]).forEach((t=>{const e=t.offsetX,g=t.offsetY;if(this.#I.down&&A.includes(this.#o)){const{x:s,y:i}=this.draw(e,g,this.#I.previous.x||e,this.#I.previous.y||g);this.#I.set(e,g),this.#I.previous.set(s,i),this.#h=1===t.pressure?.5:t.pressure||.5}else this.#I.set(e,g),this.#I.previous.set(e,g)}))}#A(t){this.mode!==l?(this.#I.down=!0,this.#G(t),this.beginStroke(this.#I.previous.x,this.#I.previous.y)):this.#m()}#b(t){this.#o!==l&&this.#I.down&&(this.#I.down=!1,this.#I.x===t.offsetX&&this.#I.y===t.offsetY&&A.includes(this.mode)&&this.draw(this.#I.x,this.#I.y,this.#I.previous.x,this.#I.previous.y),this.#I.previous.set(0,0),this.endStroke(this.#I.x,this.#I.y))}#l(){this.#i.addEventListener("message",(({data:t})=>{if("fill-result"===t.type){this.#g=!1,this.dispatchEvent("fillend",{});const e=new ImageData(t.result,this.canvas.width,this.canvas.height);this.#t.putImageData(e,0,0),this.#s.length>0&&this.#v(this.#s.shift())}}))}#m(){const{x:t,y:e}=this.#I;this.dispatchEvent("fillstart",{x:t,y:e});const g=Array.from(this.#t.getImageData(t,e,1,1).data),s={color:this.color,globalAlpha:this.#t.globalAlpha,width:this.canvas.width,height:this.canvas.height,startColor:g,startX:t*window.devicePixelRatio,startY:e*window.devicePixelRatio};this.#g?this.#s.push(s):(this.#g=!0,this.#v(s))}#v(t){const e=this.#t.getImageData(0,0,this.canvas.width,this.canvas.height).data;this.#i.postMessage({image:e,...t},[e.buffer])}}export{G as MODE_DISABLED,a as MODE_DRAW,d as MODE_ERASE,l as MODE_FILL,B as default};
