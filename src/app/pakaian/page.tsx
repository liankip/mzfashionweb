"use client"

import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {collection, getDocs, doc, updateDoc, deleteDoc, addDoc} from "firebase/firestore";
import {useCallback, useEffect, useState} from "react"
import db from "@/utils/firestore";
import {formatIDR} from "@/utils/number";
import Swal from 'sweetalert2';
import Link from "next/link";

interface Item {
    id: string
    nama: string
    harga: number
    ukuran: string
    gambar: string
}

const Pakaian = () => {
    const [items, setItems] = useState<Item[]>([])

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot = await getDocs(collection(db, "products"))
            setItems(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as Item)))
        }

        fetchItems().then(r => r)
    }, [])

    const addProduct = async () => {
        const {value: formValues} = await Swal.fire({
            title: 'Tambah Produk',
            html: `
                    <div class="space-y-4">
                        <div>
                            <label for="swal-input1" class="block text-sm font-medium text-gray-700">Nama</label>
                            <input id="swal-input1" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Name">
                        </div>
                        <div>
                            <label for="swal-input2" class="block text-sm font-medium text-gray-700">Harga</label>
                            <input id="swal-input2" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Price">
                        </div>
                        <div>
                            <label for="swal-input3" class="block text-sm font-medium text-gray-700">Ukuran</label>
                            <input id="swal-input3" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Size">
                        </div>
                        <div>
                            <label for="swal-input4" class="block text-sm font-medium text-gray-700">Gambar</label>
                            <input id="swal-input4" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Gambar">
                        </div>
                    </div>
                `,
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value,
                    (document.getElementById('swal-input3') as HTMLInputElement).value,
                    (document.getElementById('swal-input4') as HTMLInputElement).value
                ]
            },
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal'
        });

        if (formValues) {
            const [nama, harga, ukuran, gambar] = formValues;
            await addDoc(collection(db, "products"), {
                nama: nama,
                harga: parseFloat(harga),
                ukuran: ukuran,
                gambar: gambar
            });
            await Swal.fire('Success', 'Product added successfully', 'success');
        }
    };

    const editProduct = async (product: Item) => {
        const {value: formValues} = await Swal.fire({
            title: 'Edit Pakaian',
            html: `
                <div class="space-y-4">
                    <div>
                        <label for="swal-input1" class="block text-sm font-medium text-gray-700">Nama</label>
                        <input id="swal-input1" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Name" value="${product.nama}">
                    </div>
                    <div>
                        <label for="swal-input2" class="block text-sm font-medium text-gray-700">Harga</label>
                        <input id="swal-input2" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Price" value="${product.harga}">
                    </div>
                    <div>
                        <label for="swal-input3" class="block text-sm font-medium text-gray-700">Ukuran</label>
                        <input id="swal-input3" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Size" value="${product.ukuran}">
                    </div>
                    <div>
                        <label for="swal-input4" class="block text-sm font-medium text-gray-700">Gambar</label>
                        <input id="swal-input4" class="swal2-input border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Gambar" value="${product.gambar}">
                    </div>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value,
                    (document.getElementById('swal-input3') as HTMLInputElement).value,
                    (document.getElementById('swal-input4') as HTMLInputElement).value
                ]
            }
        });

        if (formValues) {
            const [nama, harga, ukuran, gambar] = formValues;
            const productRef = doc(db, "products", product.id);
            await updateDoc(productRef, {
                nama: nama,
                harga: Number(harga),
                ukuran: ukuran,
                gambar: gambar
            });

            setItems(prevItems => prevItems.map(item => item.id === product.id ? {
                ...item,
                nama: nama,
                harga: Number(harga),
                ukuran: ukuran,
                gambar: gambar
            } : item));
            await Swal.fire('Updated!', 'Product has been updated.', 'success');
        }
    };

    const deleteProduct = async (productId: string) => {
        const result = await Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Pakaian yang sudah di hapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, "products", productId));
            setItems(prevItems => prevItems.filter(item => item.id !== productId));
            await Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Pakaian"/>

            <div className="flex flex-col gap-10">
                <div
                    className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="px-4 py-6 md:px-6 xl:px-7.5">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-semibold text-black dark:text-white">
                                Daftar Pakaian
                            </h4>

                            <Link onClick={addProduct} href={"#"}
                                  className="px-4 py-2 text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800">
                                Tambah Pakaian
                            </Link>
                        </div>
                    </div>
                    {items.map((product, key) => (
                        <div
                            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                            key={key}
                        >
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
                            <div className="col-span-1 flex items-center justify-end gap-2">
                                <button className="text-sm text-blue-500 dark:text-blue-400"
                                        onClick={() => editProduct(product)}>
                                    Edit
                                </button>
                                <button className="text-sm text-red-500 dark:text-red-400"
                                        onClick={() => deleteProduct(product.id)}>
                                    Delete
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </DefaultLayout>
    )
        ;
};

export default Pakaian;
