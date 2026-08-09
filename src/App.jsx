import React, { useState } from 'react';
import './index.css';
import logo from './assets/framecs-logo.png';

const LAMBDA_API_BASE_URL = import.meta.env.VITE_LAMBDA_API_BASE_URL;

const DEVICES = [
    {
        id: import.meta.env.VITE_DEVICE_ID_PUCALLPA,
        name: 'Pucallpa',
        description: 'Chapa de Pucallpa',
    },
    {
        id: import.meta.env.VITE_DEVICE_ID_HUANCAYO,
        name: 'Huancayo',
        description: 'Chapa de Huancayo',
    }
];

const STORAGE_KEY = 'framecs-selected-device';

const App = () => {
    const [selectedDeviceId, setSelectedDeviceId] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || '';
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedDevice = DEVICES.find(
        (device) => device.id === selectedDeviceId
    );

    const handleDeviceSelect = (deviceId) => {
        if (isLoading) return;

        setSelectedDeviceId(deviceId);

        localStorage.setItem(
            STORAGE_KEY,
            deviceId
        );

        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const code = e.target.elements.code.value.trim();

        if (!selectedDeviceId) {
            setMessage('Seleccione una ubicación.');
            return;
        }

        if (!code) {
            setMessage('Por favor, ingrese un código.');
            return;
        }

        setMessage('Procesando...');
        setIsLoading(true);

        try {
            const response = await fetch(
                LAMBDA_API_BASE_URL,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code,
                        deviceId: selectedDeviceId,
                    }),
                }
            );

            const data = await response.json();

            setMessage(
                data.message ||
                'Solicitud procesada.'
            );
        } catch (error) {
            console.error('Error:', error);

            setMessage(
                'Error de comunicación con el servidor.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="custom-bg">

            <main className="access-container">

                {/* LOGO */}
                <img
                    src={logo}
                    alt="FRAMECS"
                    className="app-logo"
                />

                <section className="access-card">

                    {/* HEADER */}
                    <header className="access-header">

                        <h1>
                            Control de acceso
                        </h1>

                        <p>
                            Selecciona la puerta
                        </p>

                    </header>

                    {/* UBICACIONES */}
                    <div className="devices">

                        {DEVICES.map((device) => {

                            const isSelected =
                                selectedDeviceId === device.id;

                            return (
                                <button
                                    key={device.id}
                                    type="button"
                                    className={`device-card ${
                                        isSelected
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        handleDeviceSelect(
                                            device.id
                                        )
                                    }
                                    disabled={isLoading}
                                >

                                    <div className="device-icon">
                                        <span>⌂</span>
                                    </div>

                                    <div className="device-info">

                                        <strong>
                                            {device.name}
                                        </strong>

                                        <span>
                                            {device.description}
                                        </span>

                                    </div>

                                    <div
                                        className={`device-check ${
                                            isSelected
                                                ? 'visible'
                                                : ''
                                        }`}
                                    >
                                        ✓
                                    </div>

                                </button>
                            );
                        })}

                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit}>

                        <label htmlFor="code">
                            Código de acceso
                        </label>

                        <input
                            id="code"
                            name="code"
                            placeholder="Ingrese su código"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            className="code-input"
                            required
                            disabled={isLoading}
                            autoComplete="off"
                            onInput={(e) => {
                                e.target.value =
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 6);
                            }}
                        />

                        <button
                            type="submit"
                            className="open-button"
                            disabled={
                                isLoading ||
                                !selectedDeviceId
                            }
                        >

                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span className="lock-icon">
                                        🔓
                                    </span>
                                    Abrir puerta
                                </>
                            )}

                        </button>

                    </form>

                    {/* MENSAJE */}
                    {message && (
                        <div
                            className={`message ${
                                isLoading
                                    ? 'loading'
                                    : ''
                            }`}
                        >
                            {message}
                        </div>
                    )}

                </section>

                <footer>
                    Sistema de control de acceso
                </footer>

            </main>

        </div>
    );
};

export default App;