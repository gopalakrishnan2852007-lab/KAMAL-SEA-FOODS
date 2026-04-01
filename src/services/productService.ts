import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/ProductCard';

const PRODUCTS_COLLECTION = 'products';

// 2. FETCH PRODUCTS
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching products", error);
    throw error;
  }
};

// 3. ADD PRODUCT
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status'>) => {
  try {
    const status = productData.stock === 0 ? 'Out of Stock' : (productData.stock < 5 ? 'Low Stock' : 'In Stock');
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      status,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding product", error);
    throw error;
  }
};

// 4. UPDATE STOCK
export const updateProductStock = async (productId: string, newStock: number) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    let status = 'In Stock';
    if (newStock === 0) {
      status = 'Out of Stock';
    } else if (newStock < 5) {
      status = 'Low Stock';
    }

    await updateDoc(productRef, {
      stock: newStock,
      status: status
    });
  } catch (error) {
    console.error("Error updating stock", error);
    throw error;
  }
};

// 5. DELETE PRODUCT
export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error("Error deleting product", error);
    throw error;
  }
};
