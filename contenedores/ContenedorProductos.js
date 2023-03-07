const fs = require("fs");
const path = require("path");

class Contenedor{
    constructor(filename){
        this.filename = path.join(__dirname,"..",`DB/${filename}`);
    }

    save = async(product)=>{
        try {
            if(fs.existsSync(this.filename)){
                const productos = await this.getAll();
                const lastIdAdded = productos.reduce((acc,item)=>item.id > acc ? acc = item.id : acc, 0);
                const newProduct={id: lastIdAdded+1, ...product}
                productos.push(newProduct);
                await fs.promises.writeFile(this.filename, JSON.stringify(productos, null, 2))
                return productos;
            } else {
                const newProduct={
                    id:1,
                    ...product
                }
                await fs.promises.writeFile(this.filename, JSON.stringify([newProduct], null, 2));
            }
        } catch (error) {
            console.log("error saving",error);
        }
    }

    getAll = async()=>{
        try {
            const contenido = await fs.promises.readFile(this.filename,"utf8");
            const productos = JSON.parse(contenido);
            return productos
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Contenedor;