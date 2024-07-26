"use client"

import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {collection, getDocs, doc, updateDoc, deleteDoc, addDoc} from "firebase/firestore";
import {useCallback, useEffect, useState} from "react"
import db from "@/utils/firestore";
import {formatIDR} from "@/utils/number";

interface Item {
    id: string
    nama: string
    harga: number
    ukuran: string
    gambar: string
}

const Pakaian = () => {
    const [items, setItems] = useState<Item[]>([])
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [nama, setNama] = useState<string>("");
    const [alamat, setAlamat] = useState<string>("");

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot = await getDocs(collection(db, "products"))
            setItems(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as Item)))
        }

        fetchItems().then(r => r)
    }, [])

    const handleCheckboxChange = (productId: string) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter(id => id !== productId)
                : [...prevSelected, productId]
        );
    };

    const saveSelectedProducts = async () => {
        try {
            const transactionRef = collection(db, 'transactions');
            const selectedItems = items.filter((item) => selectedProducts.includes(item.id));
            const totalPrice = selectedItems.reduce((total, item) => total + item.harga, 0);

            const m = new Date();
            const dateString =
                m.getUTCFullYear() + "/" +
                ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" +
                ("0" + m.getUTCDate()).slice(-2) + " " +
                ("0" + m.getUTCHours()).slice(-2) + ":" +
                ("0" + m.getUTCMinutes()).slice(-2) + ":" +
                ("0" + m.getUTCSeconds()).slice(-2);

            await addDoc(transactionRef, {
                id_product: selectedProducts,
                nomor: 'TRX-' + Date.now(),
                status: "pending",
                total: totalPrice,
                penerima: nama,
                alamat: alamat,
                tanggal: dateString,
            });
            alert('Selected products saved!');
        } catch (error) {
            console.error('Error saving selected products: ', error);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Pakaian"/>

            <div className="flex flex-col gap-10">
                <div
                    className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="px-4 py-6 md:px-6 xl:px-7.5">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Daftar Pakaian
                        </h4>
                    </div>
                    {items.map((product, key) => (
                        <div
                            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                            key={key}
                        >
                            <div className="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleCheckboxChange(product.id)}
                                />
                            </div>
                            <div className="col-span-3 flex items-center">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="h-12.5 w-15 rounded-md overflow-hidden">
                                        <Image
                                            unoptimized
                                            src={product.gambar}
                                            width={80}
                                            height={80}
                                            alt="Product"
                                            className="object-contain h-full w-full"
                                        />
                                    </div>
                                    <p className="text-sm text-black dark:text-white">
                                        {product.nama}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">{product.ukuran}</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">
                                    {formatIDR(product.harga)}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="px-4 py-6 md:px-6 xl:px-7.5">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
                            <textarea
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-medium text-black dark:text-white">
                                Total: {formatIDR(
                                items
                                    .filter((item) => selectedProducts.includes(item.id))
                                    .reduce((total, item) => total + item.harga, 0)
                            )}
                            </p>
                            <button
                                onClick={saveSelectedProducts}
                                className="px-4 py-2 mt-4 text-white bg-green-500 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Pakaian;
