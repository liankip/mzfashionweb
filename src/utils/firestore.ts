import {getFirestore} from "firebase/firestore";
import {app} from '@/utils/firebase';

const db = getFirestore(app);
export default db;
