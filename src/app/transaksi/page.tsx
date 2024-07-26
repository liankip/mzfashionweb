"use client"

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {useEffect, useState} from "react";
import {collection, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import db from "@/utils/firestore";
import Image from "next/image";
import {formatIDR} from "@/utils/number";
import Link from "next/link";

interface Product {
    id: string
    nama: string
    harga: number
    ukuran: string
    gambar: string
}

interface Item {
    id: string
    nomor: string
    id_product: string[]
    penerima: string
    total: number
    status: string,
    alamat: string,
    products: Product[]
}

const Transaksi = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot = await getDocs(collection(db, "transactions"));
            const transactions: Item[] = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
                    const data = docSnapshot.data() as Omit<Item, 'id' | 'products'>;
                    const products: Product[] = await Promise.all(
                        data.id_product.map(async (productId: string) => {
                            const productDoc = await getDoc(doc(db, "products", productId));
                            return {id: productId, ...productDoc.data()} as Product;
                        })
                    );
                    return {...data, id: docSnapshot.id, products};
                })
            );

            setItems(transactions)

            const totalAmount = transactions.reduce((acc, item) => acc + item.total, 0);
            setTotal(totalAmount);
        };

        fetchItems().then(r => r);
    }, []);

    const handleUpdateStatus = async (id: string) => {
        const transactionDoc = doc(db, "transactions", id);
        await updateDoc(transactionDoc, {status: "lunas"});
        const updatedItems = items.map((item) =>
            item.id === id ? {...item, status: "lunas"} : item
        );
        setItems(updatedItems);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Transaksi"/>

            <div className="flex flex-col gap-10">
                <h1>Total Transaction {formatIDR(total)}</h1>
                <div
                    className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="px-4 py-6 md:px-6 xl:px-7.5">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-semibold text-black dark:text-white">
                                Daftar Transaksi
                            </h4>
                            <Link
                                className="px-4 py-2 text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                                href={"/transaksi/add"}>
                                Tambah Transaksi
                            </Link>
                        </div>
                    </div>

                    {items.map((item, key) => (
                        <div
                            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                            key={key}
                        >
                            <div className="col-span-2 flex items-center">
                                <p className="text-sm text-black dark:text-white">{item.nomor} (<span
                                    className={item.status == "lunas" ? "text-green-500" : "text-danger"}>{item.status}</span>)
                                </p>
                            </div>
                            <div className="col-span-3 flex items-center">
                                <div className="flex flex-col gap-4">
                                    {item.products.map((product) => (
                                        <ul key={product.id} className={"list-disc"}>
                                            <li className="text-sm text-black dark:text-white">
                                                {product.nama}
                                            </li>
                                        </ul>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <ul>
                                    <li className="text-sm text-black dark:text-white">Penerima: {item.penerima}</li>
                                    <li className="text-sm text-black dark:text-white">Alamat: {item.alamat}</li>
                                </ul>
                            </div>
                            <div className="col-span-1 flex items-center justify-between">
                                <p className="text-sm text-black dark:text-white">
                                    {formatIDR(item.total)}
                                </p>
                            </div>
                            <div className="col-span-1 flex items-center justify-between">
                                {item.status !== "lunas" && (
                                    <button
                                        className="px-2 py-1 text-white bg-green-500 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
                                        onClick={() => handleUpdateStatus(item.id)}
                                    >
                                        Update Status
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DefaultLayout>
    )
}

export default Transaksi