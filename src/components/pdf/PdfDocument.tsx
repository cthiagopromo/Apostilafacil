import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { PdfBlock } from './PdfBlock';

// Register fonts
Font.register({
    family: 'Roboto Slab',
    src: 'https://fonts.gstatic.com/s/robotoslab/v24/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISmb2Rj.ttf'
});

Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf'
});


const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 11,
        color: '#1a1a1a',
    },
    coverPage: {
        padding: 0,
        margin: 0,
        flexDirection: 'column',
    },
    coverImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minWidth: '100%',
        minHeight: '100%',
        height: '100%',
        width: '100%',
        objectFit: 'cover',
    },
    moduleTitle: {
        fontSize: 24,
        fontFamily: 'Roboto Slab',
        marginBottom: 10,
        marginTop: 20,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 10,
    },
    moduleDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    headerTitle: {
        fontSize: 10,
        color: '#999',
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pageNumber: {
        fontSize: 10,
        color: '#999',
    }
});

export const PdfDocument = ({ data }: { data: any }) => (
    <Document>
        {/* Cover Page */}
        {data.theme.cover && (
            <Page size="A4" style={styles.coverPage}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={data.theme.cover} style={styles.coverImage} />
            </Page>
        )}

        {/* Content Pages */}
        {data.projects.map((project: any, index: number) => (
            <Page key={project.id} size="A4" style={styles.page} wrap>
                <View style={styles.header} fixed>
                    <Text style={styles.headerTitle}>{data.title} - {project.title}</Text>
                </View>

                <View>
                    <Text style={styles.moduleTitle}>{project.title}</Text>
                    {project.description && <Text style={styles.moduleDescription}>{project.description}</Text>}

                    {project.blocks.map((block: any) => (
                        <PdfBlock key={block.id} block={block} />
                    ))}
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.pageNumber}>{data.title}</Text>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} />
                </View>
            </Page>
        ))}

        {/* Back Cover Page */}
        {data.theme.backCover && (
            <Page size="A4" style={styles.coverPage}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={data.theme.backCover} style={styles.coverImage} />
            </Page>
        )}
    </Document>
);
