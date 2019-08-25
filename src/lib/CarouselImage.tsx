import React from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    ImageProps,
    LayoutChangeEvent,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewProps
} from 'react-native';
import Carousel from './Carousel';
import {getTheme} from "./Utils";

const GAP_DEFAULT = 6;

export type CarouselImageItem = {
    /**
     * Identificador único do elemento
     */
    key: string;
    image: ImageProps;

    [key: string]: any;
}

export type CarouselImageProps = ViewProps & {
    /**
     * Os elementos que serão apresentados neste Carousel
     */
    data: Array<CarouselImageItem>;
    /**
     * Quantos elementos exibir na tela?
     */
    numColumns: number;
    /**
     * Espaçamento entre os itens (default 6)
     */
    gap?: number;
    /**
     * Permite adicionar uma imagem que representa esse Carousel
     */
    image?: ImageProps;
    /**
     * Informa que as imagens dos itens do Carousel serão apresentados como circulo
     */
    rounded?: boolean;
    /**
     * Invocado quando pressionar um elemento
     */
    onPress?: (item: CarouselImageItem) => void;
    /**
     * Permite renderizar conteúdo adicional para a imagem, como titulos e etc.
     */
    renderContent?: (item: CarouselImageItem) => JSX.Element | null;
}

type CarouselImageState = {
    width: number;
    itemWidth: number;
}

const styles = StyleSheet.create({
    containner: {
        width: '100%'
    },
    image: {
        position: 'absolute',
        left: 0,
        top: 0
    },
    itemContent: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    }
});

/**
 * Componente de carousel implementado com imagem, similar ao Play Store do google
 */
export default class CarouselImage extends React.PureComponent<CarouselImageProps, CarouselImageState> {

    animatedValueScroll = new Animated.Value(0);

    state: CarouselImageState = {
        width: Dimensions.get('window').width,
        itemWidth: 0
    };

    private onLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        let itemWidth = Math.round((width - (this.props.numColumns * (this.props.gap || GAP_DEFAULT))) / (this.props.numColumns + 0.25));

        this.setState({
            width: width,
            itemWidth: itemWidth
        });
    };

    render() {
        const theme = getTheme();
        return (
            <View style={styles.containner} onLayout={this.onLayout}>
                {
                    // Imagem de fundo do Carrousel
                    (this.props.image && this.state.itemWidth)
                        ? (
                            <Animated.Image
                                {...this.props.image}
                                style={[
                                    this.props.image.style,
                                    styles.image,
                                    {
                                        height: '100%',
                                        resizeMode: 'contain',
                                        width: this.state.itemWidth * 2,
                                        // Oculta imagem á medida que o scroll é executado
                                        opacity: this.animatedValueScroll.interpolate({
                                            inputRange: [0, this.state.itemWidth * 2],
                                            outputRange: [1, 0.05],
                                            easing: Easing.bezier(0, 0, 0.58, 1)
                                        }),
                                        transform: [
                                            {
                                                // Anima exibição da imagem á medida que o scroll é executado
                                                translateX: this.animatedValueScroll.interpolate({
                                                    inputRange: [0, this.state.itemWidth * 2],
                                                    outputRange: [0, -(this.state.itemWidth * 0.25)],
                                                    easing: Easing.bezier(0, 0, 0.58, 1)
                                                })
                                            }
                                        ]
                                    }
                                ]}
                            />
                        )
                        : null
                }

                {
                    // Só renderiza o carousel após calcular a largura correta
                    this.state.itemWidth
                        ? (
                            <Carousel
                                gap={this.props.gap || GAP_DEFAULT}
                                onScroll={(evt) => {
                                    if (evt && evt.nativeEvent.contentOffset.x <= this.state.itemWidth * 2) {
                                        this.animatedValueScroll.setValue(evt.nativeEvent.contentOffset.x);
                                    }
                                }}
                            >
                                {
                                    // Adiciona um item vazio no inicio, quando tiver imagem
                                    this.props.image
                                        ? <View key={'__-1'} style={{width: this.state.itemWidth * 2}}/>
                                        : null
                                }

                                {
                                    this.props.data.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={item.key}
                                                style={{flex: 1}}
                                                onPress={() => {
                                                    if (this.props.onPress) {
                                                        this.props.onPress(item);
                                                    }
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    style={{
                                                        width: this.state.itemWidth,
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Image
                                                        {...item.image}
                                                        style={[
                                                            item.image.style,
                                                            {
                                                                width: this.state.itemWidth,
                                                                height: this.state.itemWidth,
                                                                marginBottom: theme.paddingSmall
                                                            },
                                                            this.props.rounded
                                                                ? {
                                                                    borderRadius: this.state.itemWidth / 2,
                                                                    borderColor: theme.colorLine,
                                                                    borderWidth: theme.lineWidth
                                                                }
                                                                : undefined
                                                        ]}
                                                    />

                                                    {
                                                        this.props.renderContent
                                                            ? this.props.renderContent(item)
                                                            : null
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                }

                                {
                                    // Adiciona um item vazio no fim da lista
                                    this.state.itemWidth
                                        ? <View key={`_${this.props.data.length}`} style={{width: this.state.itemWidth,}}/>
                                        : null
                                }
                            </Carousel>
                        )
                        : null
                }
            </View>
        );
    }
}
