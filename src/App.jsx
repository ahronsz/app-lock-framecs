import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import logo from './assets/framecs-logo.png';

const LAMBDA_API_BASE_URL =
    import.meta.env.VITE_LAMBDA_API_BASE_URL;

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
    },
];

const STORAGE_KEY = 'framecs-selected-device';

const App = () => {
    const [selectedDeviceId, setSelectedDeviceId] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || '';
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const codeInputRef = useRef(null);

    const selectedDevice = DEVICES.find(
        (device) => device.id === selectedDeviceId
    );

    /*
     * Si el dispositivo guardado en localStorage
     * ya no existe en DEVICES, lo eliminamos.
     */
    useEffect(() => {
        const deviceExists = DEVICES.some(
            (device) => device.id === selectedDeviceId
        );

        if (selectedDeviceId && !deviceExists) {
            setSelectedDeviceId('');
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [selectedDeviceId]);

    /*
     * Cuando el usuario selecciona una puerta,
     * habilitamos el input y colocamos el foco.
     */
    useEffect(() => {
        if (selectedDeviceId && !isLoading) {
            codeInputRef.current?.focus();
        }
    }, [selectedDeviceId, isLoading]);

    const handleDeviceSelect = (deviceId) => {
        if (isLoading) {
            return;
        }

        /*
         * Si vuelve a seleccionar la misma puerta,
         * no hacemos nada.
         */
        if (deviceId === selectedDeviceId) {
            codeInputRef.current?.focus();
            return;
        }

        setSelectedDeviceId(deviceId);

        localStorage.setItem(
            STORAGE_KEY,
            deviceId
        );

        setMessage('');

        /*
         * Limpiamos el código anterior.
         */
        if (codeInputRef.current) {
            codeInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        const code =
            codeInputRef.current?.value.trim() || '';

        /*
         * Seguridad adicional:
         * aunque el input esté disabled,
         * validamos nuevamente aquí.
         */
        if (!selectedDeviceId) {
            setMessage(
                'Seleccione una puerta para continuar.'
            );
            return;
        }

        if (!code) {
            setMessage(
                'Por favor, ingrese un código.'
            );
            codeInputRef.current?.focus();
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

            /*
             * Si la solicitud terminó correctamente,
             * limpiamos el código para evitar
             * reutilizarlo accidentalmente.
             */
            if (response.ok && codeInputRef.current) {
                codeInputRef.current.value = '';
            }

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

                    {/* PUERTAS */}
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
                                    aria-pressed={isSelected}
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

                        <label
                            htmlFor="code"
                            className={
                                !selectedDeviceId
                                    ? 'disabled-label'
                                    : ''
                            }
                        >
                            Código de acceso
                        </label>

                        <input
                            ref={codeInputRef}
                            id="code"
                            name="code"
                            placeholder={
                                selectedDeviceId
                                    ? 'Ingrese su código'
                                    : 'Seleccione una puerta primero'
                            }
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            className={`code-input ${
                                !selectedDeviceId
                                    ? 'code-input-disabled'
                                    : ''
                            }`}
                            required
                            disabled={
                                !selectedDeviceId ||
                                isLoading
                            }
                            autoComplete="off"
                            aria-disabled={!selectedDeviceId}
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
                                !selectedDeviceId ||
                                isLoading
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
                            role="status"
                            aria-live="polite"
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